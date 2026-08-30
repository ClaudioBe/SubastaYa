const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('categoria', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        nombre:{
            type: DataTypes.STRING,
        },
        url_icono:{
            type:DataTypes.STRING,
        }   
    })}