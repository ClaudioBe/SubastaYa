const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('transaccion_ledger', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        billetera_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'billeteras',
                key: 'id'
            }
        },
        tipo:{
            type: DataTypes.STRING,
        },
        monto:{
            type:DataTypes.DECIMAL,
        },
        fecha:{
            type:DataTypes.DATE
        },
        subasta_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'subastas',
                key: 'id'
            }
        }   
    })}