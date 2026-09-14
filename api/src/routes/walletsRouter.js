const { Router } = require('express');
const { checkBalance, deposit } = require('../controllers/walletsControllers')
const walletsRouter = Router();

walletsRouter.get('/balance', async (req, res) => {
    try {
        const { userId } = req.query;
        const balance = await checkBalance(userId);
        res.status(200).json(balance);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

walletsRouter.post('/deposit', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const wallet = await deposit(userId, amount);
        res.status(200).json(wallet);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports = { walletsRouter }