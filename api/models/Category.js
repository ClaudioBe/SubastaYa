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
            unique: true,
            allowNull:false
        },
    }, {
        tableName: 'categories',
        timestamps: false
    })}