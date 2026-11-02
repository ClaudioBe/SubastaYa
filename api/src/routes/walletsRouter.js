const { Router } = require('express');
const { checkBalance, deposit, getMovements } = require('../controllers/walletsControllers')
const { asyncHandler } = require('../utils/asyncHandler')
const walletsRouter = Router();

walletsRouter.get('/balance', asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const balance = await checkBalance(userId);
    res.status(200).json(balance);
}))

walletsRouter.post('/deposit', asyncHandler(async (req, res) => {
    const { userId, amount } = req.body;
    const wallet = await deposit(userId, amount);
    res.status(200).json(wallet);
}))

walletsRouter.get('/movements', asyncHandler(async (req, res) => {
    const { userId } = req.query;
    const movements = await getMovements(userId);
    res.status(200).json(movements);
}))

module.exports = { walletsRouter }
