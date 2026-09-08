const { DataTypes} = require('sequelize');

module.exports = (sequelize) => {
    sequelize.define('audit_log', {
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
            }
        },
        entity:{
            type: DataTypes.STRING,
        },
        entity_id:{
            type:DataTypes.BIGINT,
        },
        action:{
            type:DataTypes.STRING,
        },
        detail_json:{
            type:DataTypes.STRING
        },
        date:{
            type:DataTypes.DATE
        } 
    })}