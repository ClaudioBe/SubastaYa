const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('wallet', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        user_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'users',
                key: 'id'
            }
        },
        total_balance:{
            type:DataTypes.DECIMAL,
        },
        withheld_balance:{
            type:DataTypes.DECIMAL,
        },
        available_balance:{
            type:DataTypes.DECIMAL
        },
        version:{
            type:DataTypes.INTEGER
        }     
    })}