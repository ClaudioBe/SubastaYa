const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('auction', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        title:{
            type: DataTypes.STRING,
            allowNull:false
        },
        seller_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'users',
                key: 'id'
            },
            allowNull:false
        },
        category_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'categories',
                key: 'id'
            }
        },
        description:{
            type:DataTypes.STRING,
            allowNull:false
        },
        url_image:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        base_price:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        min_increase:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        start_date:{
            type:DataTypes.DATE,
            allowNull:false
        },
        end_date:{
            type:DataTypes.DATE,
            allowNull:false
        },
        state:{
            type:DataTypes.STRING,
            allowNull:false
        },
    },{
        version:true,
        timestamps: false
    })}
