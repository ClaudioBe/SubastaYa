const walletsService = require('../services/walletsService');
const { toBalanceDto, toWalletDto, toMovementDto } = require('../dtos');

const balance = async (req, res) => {
    const result = await walletsService.checkBalance(req.query.userId);
    res.status(200).json(toBalanceDto(result));
};

const deposit = async (req, res) => {
    const { userId, amount } = req.body;
    const wallet = await walletsService.deposit(userId, amount);
    res.status(200).json(toWalletDto(wallet));
};

const movements = async (req, res) => {
    const result = await walletsService.getMovements(req.query.userId);
    res.status(200).json(result.map(toMovementDto));
};

module.exports = { balance, deposit, movements };
