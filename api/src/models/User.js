const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('user', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        email:{
            type: DataTypes.STRING,
        },
        name:{
            type:DataTypes.STRING,
        },
        password_hash:{
            type:DataTypes.STRING
        },
        register_date:{
            type:DataTypes.DATE
        }   
    })}