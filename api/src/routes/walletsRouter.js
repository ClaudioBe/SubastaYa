const { Router } = require('express');
const controller = require('../controllers/walletsControllers')
const { asyncHandler } = require('../utils/asyncHandler')
const walletsRouter = Router();

walletsRouter.get('/balance', asyncHandler(controller.balance))
walletsRouter.post('/deposit', asyncHandler(controller.deposit))
walletsRouter.get('/movements', asyncHandler(controller.movements))

module.exports = { walletsRouter }
