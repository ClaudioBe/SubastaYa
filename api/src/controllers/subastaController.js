const {Subasta} = require('../db')

const crearSubasta= async(subasta)=>{
    const subastaCreada=await Subasta.create(subasta);
    return subasta;
}

const listarSubastas=async()=>{
    const subastas=await Subasta.findAll();
    return subastas;
}

module.exports={crearSubasta,listarSubastas};