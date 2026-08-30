const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('billetera', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        saldo_total:{
            type:DataTypes.DECIMAL,
        },
        saldo_retenido:{
            type:DataTypes.DECIMAL,
        },
        saldo_disponible:{
            type:DataTypes.DECIMAL
        },
        version:{
            type:DataTypes.INTEGER
        }     
    })}