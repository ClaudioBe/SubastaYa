const {Router}=require('express');
const {crearSubasta,listarSubastas,obtenerSubastaPorId,}=require('../controllers/subastaController')
const {crearPuja}=require('../controllers/pujaController')
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
subastaRouter.get('/:id',async(req,res)=>{
    try {
        const getSubasta = await obtenerSubastaPorId(req.params.id);
        res.status(200).json(getSubasta);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
subastaRouter.post('/:id/pujas',async(req,res)=>{
    try {
        const { compradorId, monto } = req.body;
        const puja = await crearPuja(req.params.id, compradorId, monto);
        res.status(200).json(puja);
    } catch (error) {
        res.status(400).send(error.message)
    }
})
module.exports={subastaRouter}