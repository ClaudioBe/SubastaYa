const { Router } = require('express');
const { consultarSaldo, depositar } = require('../controllers/billeteraController')
const billeteraRouter = Router();

billeteraRouter.get('/balance', async (req, res) => {
    try {
        const { usuarioId } = req.query;
        const saldo = await consultarSaldo(usuarioId);
        res.status(200).json(saldo);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

billeteraRouter.post('/deposit', async (req, res) => {
    try {
        const { usuarioId, monto } = req.body;
        const billetera = await depositar(usuarioId, monto);
        res.status(200).json(billetera);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = { billeteraRouter }