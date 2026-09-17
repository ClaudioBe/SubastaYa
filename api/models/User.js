const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('user', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true,
            allowNull:false
        },
        email:{
            type: DataTypes.STRING,
            allowNull: false,
            unique: true 
        },
        name:{
            type:DataTypes.STRING,
            allowNull: false
        },
        password:{
            type:DataTypes.STRING,
            allowNull: false
        }
    },{timestamps: false})}