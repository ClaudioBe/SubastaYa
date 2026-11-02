const {Router}=require('express');
const {register,login}=require('../controllers/usersControllers')
const {getBidsByBuyer}=require('../controllers/bidsControllers')
const {asyncHandler}=require('../utils/asyncHandler')

const usersRouter=Router();

usersRouter.post('/register',asyncHandler(async(req,res)=>{
    const newUser = await register(req.body);
    res.status(201).send(newUser)
}))

usersRouter.post('/login',asyncHandler(async(req,res)=>{
    const user = await login(req.body)
    res.status(200).json(user);
}))

usersRouter.get('/:id/bids',asyncHandler(async(req,res)=>{
    const bids = await getBidsByBuyer(req.params.id);
    res.status(200).json(bids);
}))

module.exports={usersRouter}
