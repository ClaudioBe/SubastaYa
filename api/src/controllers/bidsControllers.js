const { conn, Auction, Bid, Wallet, Transaction_ledger } = require('../db')

const createBid = async (auctionId, buyerId, amount) => {
    return await conn.transaction(async (t) => {

        //Trae la auction y valida estado
        const auction = await Auction.findByPk(auctionId, { transaction: t });
        if (!auction) throw new Error('subasta no encontrada');
        if (auction.state !== 'ACTIVA') throw new Error('La subasta no está activa');
        if (new Date() > new Date(auction.end_date)) throw new Error('La subasta ya finalizó');

        //Valida el monto contra la puja más alta actual
        const currentBid = await Bid.findOne({
            where: { auction_id: auctionId },
            order: [['amount', 'DESC']],
            transaction: t
        });
        const minAmount = (currentBid ? Number(currentBid.amount) : Number(auction.base_price)) + Number(auction.min_increase);
        if (Number(amount) < minAmount) throw new Error(`El monto debe ser al menos ${minAmount}`);

        //Valida y retenie saldo del nuevo postor
        const wallet = await Wallet.findOne({ where: { user_id: buyerId }, transaction: t });
        if (!wallet || Number(wallet.available_balance) < Number(amount)) {
            throw new Error('Saldo insuficiente');
        }
        const [affectedWallet] = await Wallet.update(
            {
                available_balance: Number(wallet.available_balance) - Number(amount),
                withheld_balance: Number(wallet.withheld_balance) + Number(amount),
                version: wallet.version + 1
            },
            { where: { id: wallet.id, version: wallet.version }, transaction: t }
        );
        if (affectedWallet === 0) throw new Error('Conflicto de concurrencia en la billetera, reintentar');

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
            const [previousAffected] = await Wallet.update(
                {
                    available_balance: Number(previousWallet.available_balance) + Number(currentBid.amount),
                    withheld_balance: Number(previousWallet.withheld_balance) - Number(currentBid.amount),
                    version: previousWallet.version + 1
                },
                { where: { id: previousWallet.id, version: previousWallet.version }, transaction: t }
            );
            if (previousAffected === 0) throw new Error('Conflicto de concurrencia liberando billetera anterior');

            await Transaction_ledger.create({
                wallet_id: previousWallet.id,
                type: 'LIBERACION',
                amount: currentBid.amount,
                date: new Date(),
                auction_id: auctionId
            }, { transaction: t });
        }

        //Anti-sniping:
        const minutesRemaining = (new Date(auction.end_date) - new Date()) / 60000;
        if (minutesRemaining < 5) {
            const newDate = new Date(Date.now() + 5 * 60000);
            const [affectedAuction] = await auction.update(
                { end_date: newDate, version: auction.version + 1 },
                { where: { id: auction.id, version: auction.version }, transaction: t }
            );
            if (affectedAuction === 0) throw new Error('Conflicto de concurrencia en la auction, reintentar');
        }

        //Crea la puja
        const newBid = await Bid.create({
            auction_id: auctionId,
            buyer_id: buyerId,
            amount,
            bid_date: new Date()
        }, { transaction: t });

        return newBid;
    });
}

module.exports = { createBid };