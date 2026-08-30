const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('subasta', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        titulo:{
            type: DataTypes.STRING,
        },
        descripcion:{
            type:DataTypes.STRING,
        },
        url_imagen:{
            type:DataTypes.STRING
        },
        precio_base:{
            type:DataTypes.DECIMAL
        },
        incremento_minimo:{
            type:DataTypes.DECIMAL
        },
        fecha_inicio:{
            type:DataTypes.DATE
        },
        fecha_fin:{
            type:DataTypes.DATE
        },
        estado:{
            type:DataTypes.STRING
        },
        version:{
            type:DataTypes.INTEGER
        }       
    })}
