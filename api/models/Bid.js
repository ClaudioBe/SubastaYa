const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('bid', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        auction_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'auctions',
                key: 'id'
            },
            allowNull:false
        },
        buyer_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'users',
                key: 'id'
            },
            allowNull:false
        },
        amount:{
            type: DataTypes.DECIMAL,
            allowNull:false
        },
        bid_date:{
            type:DataTypes.DATE,
            allowNull:false
        }      
    },{timestamps: false})}