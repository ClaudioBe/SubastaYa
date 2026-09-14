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
        password:{
            type:DataTypes.STRING
        },
        role:{
            type:DataTypes.STRING
        }
    })}