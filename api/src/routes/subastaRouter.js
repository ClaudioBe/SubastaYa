const {Router}=require('express');
const {crearSubasta,listarSubastas}=require('../controllers/subastaController')
const subastaRouter=Router();

subastaRouter.post('/',async(req,res)=>{
    try {
        const postSubasta = await crearSubasta(req.body);
        res.status(200).json(postSubasta);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

subastaRouter.get('/',async(req,res)=>{
    try {
        const getSubastas = await listarSubastas(req.body);
        res.status(200).json(getSubastas);
    } catch (error) {
        res.status(400).send(error.message)
    }
})

module.exports={subastaRouter}