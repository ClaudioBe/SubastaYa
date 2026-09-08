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
            }
        },
        buyer_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'users',
                key: 'id'
            }
        },
        amount:{
            type: DataTypes.DECIMAL,
        },
        bid_date:{
            type:DataTypes.DATE,
        }      
    })}