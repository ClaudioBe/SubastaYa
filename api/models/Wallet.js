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
            },
            unique: true,
            allowNull:false
        },
        total_balance:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        withheld_balance:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        available_balance:{
            type:DataTypes.DECIMAL,
            allowNull:false
        }    
    },{
        version:true,
        timestamps: false
    }     
)}