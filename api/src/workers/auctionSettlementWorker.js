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
            const [affected] = await Auction.update(
                { state: 'DESIERTA', version: auction.version + 1 },
                { where: { id: auction.id, version: auction.version }, transaction: t }
            );
            if (affected === 0) return null;

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
        const [buyerAffected] = await Wallet.update(
            {
                total_balance: Number(buyerWallet.total_balance) - amount,
                withheld_balance: Number(buyerWallet.withheld_balance) - amount,
                version: buyerWallet.version + 1
            },
            { where: { id: buyerWallet.id, version: buyerWallet.version }, transaction: t }
        );
        if (buyerAffected === 0) throw new Error('Conflicto de concurrencia liquidando la billetera del comprador');

        //2. Acreditar al vendedor
        const [sellerAffected] = await Wallet.update(
            {
                total_balance: Number(sellerWallet.total_balance) + amount,
                available_balance: Number(sellerWallet.available_balance) + amount,
                version: sellerWallet.version + 1
            },
            { where: { id: sellerWallet.id, version: sellerWallet.version }, transaction: t }
        );
        if (sellerAffected === 0) throw new Error('Conflicto de concurrencia liquidando la billetera del vendedor');

        //3. Escribir en el ledger
        await Transaction_ledger.create({
            wallet_id: buyerWallet.id, type: 'DEBITO', amount, date: new Date(), auction_id: auction.id
        }, { transaction: t });
        await Transaction_ledger.create({
            wallet_id: sellerWallet.id, type: 'VENTA', amount, date: new Date(), auction_id: auction.id
        }, { transaction: t });

        const [auctionAffected] = await Auction.update(
            { state: 'FINALIZADA', version: auction.version + 1 },
            { where: { id: auction.id, version: auction.version }, transaction: t }
        );
        if (auctionAffected === 0) throw new Error('Conflicto de concurrencia finalizando la subasta');

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
        runAuctionSettlement().catch((err) => console.error('[auction-worker] Error en la corrida:', err.message));
    }, intervalMs);
};

const stopAuctionSettlementWorker = () => {
    clearInterval(intervalHandle);
    intervalHandle = null;
};

module.exports = { runAuctionSettlement, settleAuction, startAuctionSettlementWorker, stopAuctionSettlementWorker };
