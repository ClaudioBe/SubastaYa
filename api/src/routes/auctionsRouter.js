const {Router}=require('express');
const controller=require('../controllers/auctionsControllers')
const {asyncHandler}=require('../utils/asyncHandler')
const auctionsRouter=Router();

auctionsRouter.post('/',asyncHandler(controller.create))
auctionsRouter.get('/',asyncHandler(controller.list))
auctionsRouter.get('/categories',asyncHandler(controller.listCategories))
auctionsRouter.get('/:id',asyncHandler(controller.getById))
auctionsRouter.post('/:id/bids',asyncHandler(controller.placeBid))

module.exports={auctionsRouter}
