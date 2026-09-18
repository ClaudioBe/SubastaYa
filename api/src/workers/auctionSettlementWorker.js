const { Op } = require('sequelize');
const { conn, Auction, Bid, Wallet, Transaction_ledger, Audit_log } = require('../db');
const { emitToAuction, emitToUser } = require('../sockets');

//Liquida una subasta vencida: la marca DESIERTA si no tuvo pujas, o FINALIZADA + liquidación atómica si tuvo ganador
const settleAuction = async (auctionId) => {
    const result = await conn.transaction(async (t) => {
        const auction = await Auction.findOne({ where: { id: auctionId, state: 'ACTIVA' }, transaction: t });
        if (!auction) return null; // ya procesada en otra corrida, o cerrada por una puja concurrente

        const winningBid = await Bid.findOne({
            where: { auction_id: auctionId },
            order: [['amount', 'DESC']],
            transaction: t
        });

        if (!winningBid) {
            await auction.update({ state: 'DESIERTA' }, { transaction: t });

            await Audit_log.create({
                user_id: null,
                entity: 'auction',
                entity_id: auction.id,
                action: 'AUCTION_DESIERTA',
                detail_json: JSON.stringify({ reason: 'Venció sin pujas' }),
                date: new Date()
            }, { transaction: t });

            return { state: 'DESIERTA' };
        }

        //Liquidación atómica
        const amount = Number(winningBid.amount);
        const buyerWallet = await Wallet.findOne({ where: { user_id: winningBid.buyer_id }, transaction: t });
        const sellerWallet = await Wallet.findOne({ where: { user_id: auction.seller_id }, transaction: t });

        //1. Debitar al comprador: la retención pasa a ser un gasto real
        await buyerWallet.update(
            {
                total_balance: Number(buyerWallet.total_balance) - amount,
                withheld_balance: Number(buyerWallet.withheld_balance) - amount,
            },
            { transaction: t }
        );

        //2. Acreditar al vendedor
        await sellerWallet.update(
            {
                total_balance: Number(sellerWallet.total_balance) + amount,
                available_balance: Number(sellerWallet.available_balance) + amount,
            },
            { transaction: t }
        );

        //3. Escribir en el ledger
        await Transaction_ledger.create({
            wallet_id: buyerWallet.id, type: 'DEBITO', amount, date: new Date(), auction_id: auction.id
        }, { transaction: t });
        await Transaction_ledger.create({
            wallet_id: sellerWallet.id, type: 'VENTA', amount, date: new Date(), auction_id: auction.id
        }, { transaction: t });

        await auction.update({ state: 'FINALIZADA' }, { transaction: t });

        await Audit_log.create({
            user_id: winningBid.buyer_id,
            entity: 'auction',
            entity_id: auction.id,
            action: 'AUCTION_FINALIZADA_VENTA',
            detail_json: JSON.stringify({ amount, buyer_id: winningBid.buyer_id, seller_id: auction.seller_id }),
            date: new Date()
        }, { transaction: t });

        return { state: 'FINALIZADA', buyerId: winningBid.buyer_id, sellerId: auction.seller_id };
    });

    if (!result) return;

    emitToAuction(auctionId, 'auction:closed', { auctionId, state: result.state });
    if (result.state === 'FINALIZADA') {
        emitToUser(result.buyerId, 'wallet:update');
        emitToUser(result.sellerId, 'wallet:update');
    }
};

//Activa subastas PRÓXIMA cuya start_date ya llegó
const activateScheduledAuctions = async () => {
    const dueAuctions = await Auction.findAll({
        where: { state: 'PRÓXIMA', start_date: { [Op.lte]: new Date() } },
        attributes: ['id']
    });

    for (const { id } of dueAuctions) {
        try {
            await conn.transaction(async (t) => {
                const auction = await Auction.findOne({ where: { id, state: 'PRÓXIMA' }, transaction: t });
                if (!auction) return;

                await auction.update({ state: 'ACTIVA' }, { transaction: t });

                await Audit_log.create({
                    user_id: null,
                    entity: 'auction',
                    entity_id: id,
                    action: 'AUCTION_ACTIVATED',
                    detail_json: JSON.stringify({ reason: 'Llegó la fecha de inicio programada' }),
                    date: new Date()
                }, { transaction: t });
            });
            emitToAuction(id, 'auction:activated', { auctionId: id });
        } catch (err) {
            console.error(`[auction-worker] Error activando subasta ${id}:`, err.message);
        }
    }
};

//Busca subastas ACTIVAs cuyo end_date ya pasó y las liquida una por una
const runAuctionSettlement = async () => {
    const expiredAuctions = await Auction.findAll({
        where: { state: 'ACTIVA', end_date: { [Op.lt]: new Date() } },
        attributes: ['id']
    });

    for (const { id } of expiredAuctions) {
        try {
            await settleAuction(id);
        } catch (err) {
            console.error(`[auction-worker] Error liquidando subasta ${id}:`, err.message);
        }
    }
};

let intervalHandle = null;

const startAuctionSettlementWorker = (intervalMs = Number(process.env.AUCTION_WORKER_INTERVAL_MS) || 30000) => {
    if (intervalHandle) return;
    intervalHandle = setInterval(() => {
        activateScheduledAuctions().catch((err) => console.error('[auction-worker] Error activando subastas:', err.message));
        runAuctionSettlement().catch((err) => console.error('[auction-worker] Error en la corrida:', err.message));
    }, intervalMs);
};

const stopAuctionSettlementWorker = () => {
    clearInterval(intervalHandle);
    intervalHandle = null;
};

module.exports = { runAuctionSettlement, settleAuction, activateScheduledAuctions, startAuctionSettlementWorker, stopAuctionSettlementWorker };
