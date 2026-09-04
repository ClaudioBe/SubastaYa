const { conn, Subasta, Puja, Billetera, Transaccion_ledger } = require('../db')

const crearPuja = async (subastaId, compradorId, monto) => {
    return await conn.transaction(async (t) => {

        //Trae la subasta y valida estado
        const subasta = await Subasta.findByPk(subastaId, { transaction: t });
        if (!subasta) throw new Error('Subasta no encontrada');
        if (subasta.estado !== 'ACTIVA') throw new Error('La subasta no está activa');
        if (new Date() > new Date(subasta.fecha_fin)) throw new Error('La subasta ya finalizó');

        //Valida el monto contra la puja más alta actual
        const pujaActual = await Puja.findOne({
            where: { subasta_id: subastaId },
            order: [['monto', 'DESC']],
            transaction: t
        });
        const montoMinimo = (pujaActual ? Number(pujaActual.monto) : Number(subasta.precio_base)) + Number(subasta.incremento_minimo);
        if (Number(monto) < montoMinimo) throw new Error(`El monto debe ser al menos ${montoMinimo}`);

        //Valida y retenie saldo del nuevo postor
        const billetera = await Billetera.findOne({ where: { usuario_id: compradorId }, transaction: t });
        if (!billetera || Number(billetera.saldo_disponible) < Number(monto)) {
            throw new Error('Saldo insuficiente');
        }
        const [afectadosBilletera] = await Billetera.update(
            {
                saldo_disponible: Number(billetera.saldo_disponible) - Number(monto),
                saldo_retenido: Number(billetera.saldo_retenido) + Number(monto),
                version: billetera.version + 1
            },
            { where: { id: billetera.id, version: billetera.version }, transaction: t }
        );
        if (afectadosBilletera === 0) throw new Error('Conflicto de concurrencia en la billetera, reintentar');

        await Transaccion_ledger.create({
            billetera_id: billetera.id,
            tipo: 'RETENCION',
            monto,
            fecha: new Date(),
            subasta_id: subastaId
        }, { transaction: t });

        //Libera la retención del postor anterior (si había)
        if (pujaActual) {
            const billeteraAnterior = await Billetera.findOne({ where: { usuario_id: pujaActual.comprador_id }, transaction: t });
            const [afectadosAnterior] = await Billetera.update(
                {
                    saldo_disponible: Number(billeteraAnterior.saldo_disponible) + Number(pujaActual.monto),
                    saldo_retenido: Number(billeteraAnterior.saldo_retenido) - Number(pujaActual.monto),
                    version: billeteraAnterior.version + 1
                },
                { where: { id: billeteraAnterior.id, version: billeteraAnterior.version }, transaction: t }
            );
            if (afectadosAnterior === 0) throw new Error('Conflicto de concurrencia liberando billetera anterior');

            await Transaccion_ledger.create({
                billetera_id: billeteraAnterior.id,
                tipo: 'LIBERACION',
                monto: pujaActual.monto,
                fecha: new Date(),
                subasta_id: subastaId
            }, { transaction: t });
        }

        //Anti-sniping:
        const minutosRestantes = (new Date(subasta.fecha_fin) - new Date()) / 60000;
        if (minutosRestantes < 5) {
            const nuevaFecha = new Date(Date.now() + 5 * 60000);
            const [afectadosSubasta] = await Subasta.update(
                { fecha_fin: nuevaFecha, version: subasta.version + 1 },
                { where: { id: subasta.id, version: subasta.version }, transaction: t }
            );
            if (afectadosSubasta === 0) throw new Error('Conflicto de concurrencia en la subasta, reintentar');
        }

        //Crea la puja
        const nuevaPuja = await Puja.create({
            subasta_id: subastaId,
            comprador_id: compradorId,
            monto,
            fecha_puja: new Date()
        }, { transaction: t });

        return nuevaPuja;
    });
}

module.exports = { crearPuja };