const { conn, Auction, Bid, Wallet, Transaction_ledger, Audit_log } = require('../db')
const { emitToAuction, emitToUser } = require('../sockets')

const createBid = async (auctionId, buyerId, amount) => {
    try {
        const newBid = await conn.transaction(async (t) => {

            //Trae la auction y valida estado. Lock de fila: serializa todas las pujas concurrentes
            //sobre esta misma subasta, para que "currentBid" nunca se lea con datos obsoletos.
            const auction = await Auction.findByPk(auctionId, { transaction: t, lock: t.LOCK.UPDATE });
            if (!auction) throw new Error('subasta no encontrada');
            if (auction.state !== 'ACTIVA') throw new Error('La subasta no está activa');

            if (auction.seller_id === buyerId) {
                throw new Error('Un vendedor no puede realizar ofertas en su propia subasta');
            }

            if (new Date() > new Date(auction.end_date)) throw new Error('La subasta ya finalizó');

            //Valida el monto contra la puja más alta actual
            const currentBid = await Bid.findOne({
                where: { auction_id: auctionId },
                order: [['amount', 'DESC']],
                transaction: t
            });
            const minAmount = (currentBid ? Number(currentBid.amount) : Number(auction.base_price)) + Number(auction.min_increase);
            if (Number(amount) < minAmount) throw new Error(`El monto debe ser al menos ${minAmount}`);

            //Valida y retiene saldo del nuevo postor
            const wallet = await Wallet.findOne({ where: { user_id: buyerId }, transaction: t });
            if (!wallet || Number(wallet.available_balance) < Number(amount)) {
                throw new Error('Saldo insuficiente');
            }
            await wallet.update(
                {
                    available_balance: Number(wallet.available_balance) - Number(amount),
                    withheld_balance: Number(wallet.withheld_balance) + Number(amount),
                },
                { transaction: t }
            );

            await Transaction_ledger.create({
                wallet_id: wallet.id,
                type: 'RETENCION',
                amount,
                date: new Date(),
                auction_id: auctionId
            }, { transaction: t });

            //Libera la retención del postor anterior (si había)
            if (currentBid) {
                const previousWallet = await Wallet.findOne({ where: { user_id: currentBid.buyer_id }, transaction: t });
                if (previousWallet) {
                    await previousWallet.update(
                        {
                            available_balance: Number(previousWallet.available_balance) + Number(currentBid.amount),
                            withheld_balance: Number(previousWallet.withheld_balance) - Number(currentBid.amount)
                        },
                        { transaction: t }
                    );

                    await Transaction_ledger.create({
                        wallet_id: previousWallet.id,
                        type: 'LIBERACION',
                        amount: currentBid.amount,
                        date: new Date(),
                        auction_id: auctionId
                    }, { transaction: t });
                }
            }

            //Anti-sniping: si la puja entra dentro de los últimos 60 segundos, extiende el cierre 2 minutos
            let endDate = auction.end_date;
            const secondsRemaining = (new Date(auction.end_date) - new Date()) / 1000;
            if (secondsRemaining <= 60) {
                const previousEndDate = auction.end_date;
                const newDate = new Date(Date.now() + 2 * 60000);
                await auction.update(
                    { end_date: newDate },
                    { transaction: t }
                );

                endDate = newDate;

                await Audit_log.create({
                    user_id: buyerId,
                    entity: 'auction',
                    entity_id: auctionId,
                    action: 'ANTI_SNIPING_EXTENSION',
                    detail_json: JSON.stringify({ previousEndDate, newEndDate: newDate, triggeredByBidAmount: amount }),
                    date: new Date()
                }, { transaction: t });
            }

            //Crea la puja
            const bid = await Bid.create({
                auction_id: auctionId,
                buyer_id: buyerId,
                amount,
                bid_date: new Date()
            }, { transaction: t });

            return { bid, previousBuyerId: currentBid?.buyer_id, endDate };
        });

        //Notifica en tiempo real, ya con la transacción confirmada
        emitToAuction(auctionId, 'bid:new', { bid: newBid.bid, endDate: newBid.endDate });
        emitToUser(buyerId, 'wallet:update');
        if (newBid.previousBuyerId) emitToUser(newBid.previousBuyerId, 'wallet:update');

        return newBid.bid;
    } catch (err) {
        //Registra el intento rechazado (validación de negocio o conflicto de concurrencia) aunque la transacción haya hecho rollback
        await Audit_log.create({
            user_id: buyerId,
            entity: 'bid',
            entity_id: auctionId,
            action: 'BID_REJECTED',
            detail_json: JSON.stringify({ auctionId, buyerId, amount, reason: err.message }),
            date: new Date()
        }).catch((auditErr) => console.error('[audit] No se pudo registrar el rechazo de puja:', auditErr.message));

        throw err;
    }
}

const getBidsByBuyer = async (buyerId) => {
    const bids = await Bid.findAll({
        where: { buyer_id: buyerId },
        include: [{ model: Auction, include: [Bid] }]
    });

    const auctionsById = new Map();
    for (const bid of bids) {
        if (bid.auction && !auctionsById.has(bid.auction.id)) auctionsById.set(bid.auction.id, bid.auction);
    }

    return [...auctionsById.values()].map(auction => {
        const allBids = auction.bids;
        const highestBid = allBids.reduce((max, b) => (Number(b.amount) > Number(max.amount) ? b : max));
        const myBestAmount = Math.max(
            ...allBids.filter(b => Number(b.buyer_id) === Number(buyerId)).map(b => Number(b.amount))
        );
        const isWinning = Number(highestBid.amount) === myBestAmount;
        const isFinished = auction.state !== 'ACTIVA' || new Date() > new Date(auction.end_date);

        let status;
        if (isFinished) status = isWinning ? 'GANADA' : 'PERDIDA';
        else status = isWinning ? 'GANANDO' : 'SUPERADO';

        return {
            id: auction.id,
            title: auction.title,
            url_image: auction.url_image,
            end_date: auction.end_date,
            myBestAmount,
            highestAmount: Number(highestBid.amount),
            status
        };
    });
};

module.exports = { createBid, getBidsByBuyer };
