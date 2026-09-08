const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('category', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        name:{
            type: DataTypes.STRING,
        },
        icon_url:{
            type:DataTypes.STRING,
        }
    }, {
        tableName: 'categories'
    })}