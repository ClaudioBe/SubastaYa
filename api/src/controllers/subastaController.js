const {Subasta} = require('../db')

const crearSubasta= async(subasta)=>{
    const subastaCreada=await Subasta.create(subasta);
    return subasta;
}

const listarSubastas=async()=>{
    const subastas=await Subasta.findAll();
    return subastas;
}

const obtenerSubastaPorId=async(id)=>{
    const subasta=await Subasta.findByPk(id);
    return subasta;
}   
module.exports={crearSubasta,listarSubastas,obtenerSubastaPorId};