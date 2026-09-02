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
            allowNull:false
        },
        descripcion:{
            type:DataTypes.STRING,
            allowNull:false
        },
        url_imagen:{
            type:DataTypes.STRING,
            allowNull:false
        },
        precio_base:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        incremento_minimo:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        fecha_inicio:{
            type:DataTypes.DATE,
            allowNull:false
        },
        fecha_fin:{
            type:DataTypes.DATE,
            allowNull:false
        },
        estado:{
            type:DataTypes.STRING,
            allowNull:false
        },
        version:{
            type:DataTypes.INTEGER,
            allowNull:false
        }       
    })}
