const { conn, Wallet, Transaction_ledger } = require('../db')

const consultarSaldo = async (usuarioId) => {
    const wallet = await Wallet.findOne({ where: { user_id: usuarioId } });
    if (!wallet) throw new Error('El usuario no tiene billetera');
    return {
        total_balance: wallet.total_balance,
        withheld_balance: wallet.withheld_balance,
        available_balance: wallet.available_balance
    };
}

const depositar = async (usuarioId, monto) => {
    if (Number(monto) <= 0) throw new Error('El monto debe ser mayor a 0');

    return await conn.transaction(async (t) => {
        const wallet = await Wallet.findOne({ where: { user_id: usuarioId }, transaction: t });
        if (!wallet) throw new Error('El usuario no tiene billetera');

        const [afectados] = await Wallet.update(
            {
                total_balance: Number(wallet.total_balance) + Number(monto),
                available_balance: Number(wallet.available_balance) + Number(monto),
                version: wallet.version + 1
            },
            { where: { id: wallet.id, version: wallet.version }, transaction: t }
        );
        if (afectados === 0) throw new Error('Conflicto de concurrencia en la billetera, reintentar');

        await Transaction_ledger.create({
            wallet_id: wallet.id,
            type: 'DEPOSITO',
            amount: monto,
            date: new Date()
        }, { transaction: t });

        return await Wallet.findByPk(wallet.id, { transaction: t });
    });
}

module.exports = { consultarSaldo, depositar };
