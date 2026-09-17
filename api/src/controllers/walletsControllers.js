const { conn, Wallet, Transaction_ledger, Auction, Audit_log} = require('../db')
const { emitToUser } = require('../sockets')

const checkBalance = async (userId) => {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) throw new Error('El usuario no tiene billetera');
    return {
        total_balance: wallet.total_balance,
        withheld_balance: wallet.withheld_balance,
        available_balance: wallet.available_balance
    };
}

const deposit = async (userId, amount) => {
    if (Number(amount) <= 0) throw new Error('El monto debe ser mayor a 0');

    const updatedWallet = await conn.transaction(async (t) => {
        const wallet = await Wallet.findOne({ where: { user_id: userId }, transaction: t });
        if (!wallet) throw new Error('El usuario no tiene billetera');

        const [affected] = await Wallet.update(
            {
                total_balance: Number(wallet.total_balance) + Number(amount),
                available_balance: Number(wallet.available_balance) + Number(amount),
                version: wallet.version + 1
            },
            { where: { id: wallet.id, version: wallet.version }, transaction: t }
        );
        if (affected === 0) throw new Error('Conflicto de concurrencia en la billetera, reintentar');

        await Transaction_ledger.create({
            wallet_id: wallet.id,
            type: 'DEPOSITO',
            amount,
            date: new Date()
        }, { transaction: t });

        await Audit_log.create({
            user_id: userId,
            entity: 'wallet',
            entity_id: wallet.id,
            action: 'WALLET_CREDIT',
            detail_json: JSON.stringify({ amount }),
            date: new Date()
        }, { transaction: t });

        return await Wallet.findByPk(wallet.id, { transaction: t });
    });

    emitToUser(userId, 'wallet:update');

    return updatedWallet;
}

const getMovements = async (userId) => {
    const wallet = await Wallet.findOne({ where: { user_id: userId } });
    if (!wallet) throw new Error('El usuario no tiene billetera');

    return await Transaction_ledger.findAll({
        where: { wallet_id: wallet.id },
        include: [{ model: Auction, attributes: ['title'] }],
        order: [['date', 'DESC']]
    });
};

module.exports = { checkBalance, deposit, getMovements };
