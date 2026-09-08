const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('transaction_ledger', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        wallet_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'wallets',
                key: 'id'
            }
        },
        type:{
            type: DataTypes.STRING,
        },
        amount:{
            type:DataTypes.DECIMAL,
        },
        date:{
            type:DataTypes.DATE
        },
        auction_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'auctions',
                key: 'id'
            }
        }   
    })}