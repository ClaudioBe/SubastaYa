const {Router}=require('express');
const {register,login}=require('../controllers/usersControllers')
const {getBidsByBuyer}=require('../controllers/bidsControllers')

const usersRouter=Router();

usersRouter.post('/register',async(req,res)=>{
    try {
        const newUser = await register(req.body);
        res.status(201).send(newUser)
    } catch (error) {
        res.status(400).json(JSON.parse(error.message))
    }
})

usersRouter.post('/login',async(req,res)=>{
    try {
        const user = await login(req.body)
        res.status(201).json(user);
    } catch (error) {
        res.status(400).json(JSON.parse(error.message))
    }
})

usersRouter.get('/:id/bids',async(req,res)=>{
    try {
        const bids = await getBidsByBuyer(req.params.id);
        res.status(200).json(bids);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports={usersRouter}