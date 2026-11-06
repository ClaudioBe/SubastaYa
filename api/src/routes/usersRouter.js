const {Router}=require('express');
const controller=require('../controllers/usersControllers')
const {asyncHandler}=require('../utils/asyncHandler')

const usersRouter=Router();

usersRouter.post('/register',asyncHandler(controller.register))
usersRouter.post('/login',asyncHandler(controller.login))
usersRouter.get('/:id/bids',asyncHandler(controller.listBids))

module.exports={usersRouter}
