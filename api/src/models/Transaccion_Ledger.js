const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('transaccion_ledger', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        tipo:{
            type: DataTypes.STRING,
        },
        monto:{
            type:DataTypes.DECIMAL,
        },
        fecha:{
            type:DataTypes.DATE
        }    
    })}