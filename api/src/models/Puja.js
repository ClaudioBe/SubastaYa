const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('puja', {
        id:{
            type:DataTypes.BIGINT,
            autoIncrement:true,
            primaryKey:true
        },
        subasta_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'subastas',
                key: 'id'
            }
        },
        comprador_id:{
            type:DataTypes.BIGINT,
            references:{
                model: 'usuarios',
                key: 'id'
            }
        },
        monto:{
            type: DataTypes.DECIMAL,
        },
        fecha_puja:{
            type:DataTypes.DATE,
        }      
    })}