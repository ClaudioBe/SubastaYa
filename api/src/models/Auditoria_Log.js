const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('auditoria_log', {
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
        entidad:{
            type: DataTypes.STRING,
        },
        entidad_id:{
            type:DataTypes.BIGINT,
        },
        accion:{
            type:DataTypes.STRING,
        },
        detalle_json:{
            type:DataTypes.STRING
        },
        fecha:{
            type:DataTypes.DATE
        } 
    })}