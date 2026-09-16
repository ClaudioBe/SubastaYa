const {Router}=require('express');
const {register,login}=require('../controllers/usersControllers')

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

module.exports={usersRouter}