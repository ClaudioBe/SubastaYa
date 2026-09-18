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
            },
            allowNull:false
        },
        type:{
            type: DataTypes.STRING,
            allowNull:false
        },
        amount:{
            type:DataTypes.DECIMAL,
            allowNull:false
        },
        date:{
            type:DataTypes.DATE,
            allowNull:false
        },
        auction_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'auctions',
                key: 'id'
            }
        }
    },{timestamps: false})}