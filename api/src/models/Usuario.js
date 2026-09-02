const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('usuario', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        email:{
            type: DataTypes.STRING,
        },
        nombre:{
            type:DataTypes.STRING,
        },
        password_hash:{
            type:DataTypes.STRING
        },
        fecha_registro:{
            type:DataTypes.DATE
        }   
    })}