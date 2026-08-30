const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('puja', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        monto:{
            type: DataTypes.DECIMAL,
        },
        fecha_puja:{
            type:DataTypes.DATE,
        }      
    })}