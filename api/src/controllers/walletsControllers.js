const { conn, Billetera, Transaccion_ledger } = require('../db')

const consultarSaldo = async (usuarioId) => {
    const billetera = await Billetera.findOne({ where: { usuario_id: usuarioId } });
    if (!billetera) throw new Error('El usuario no tiene billetera');
    return {
        saldo_total: billetera.saldo_total,
        saldo_retenido: billetera.saldo_retenido,
        saldo_disponible: billetera.saldo_disponible
    };
}

const depositar = async (usuarioId, monto) => {
    if (Number(monto) <= 0) throw new Error('El monto debe ser mayor a 0');

    return await conn.transaction(async (t) => {
        const billetera = await Billetera.findOne({ where: { usuario_id: usuarioId }, transaction: t });
        if (!billetera) throw new Error('El usuario no tiene billetera');

        const [afectados] = await Billetera.update(
            {
                saldo_total: Number(billetera.saldo_total) + Number(monto),
                saldo_disponible: Number(billetera.saldo_disponible) + Number(monto),
                version: billetera.version + 1
            },
            { where: { id: billetera.id, version: billetera.version }, transaction: t }
        );
        if (afectados === 0) throw new Error('Conflicto de concurrencia en la billetera, reintentar');

        await Transaccion_ledger.create({
            billetera_id: billetera.id,
            tipo: 'DEPOSITO',
            monto,
            fecha: new Date()
        }, { transaction: t });

        return await Billetera.findByPk(billetera.id, { transaction: t });
    });
}

module.exports = { consultarSaldo, depositar };