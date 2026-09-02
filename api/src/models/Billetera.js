const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('billetera', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        usuario_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'usuarios',
                key: 'id'
            }
        },
        saldo_total:{
            type:DataTypes.DECIMAL,
        },
        saldo_retenido:{
            type:DataTypes.DECIMAL,
        },
        saldo_disponible:{
            type:DataTypes.DECIMAL
        },
        version:{
            type:DataTypes.INTEGER
        }     
    })}