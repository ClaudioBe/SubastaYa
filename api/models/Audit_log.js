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
            },
            allowNull:false
        },
        entity:{
            type: DataTypes.STRING,
            allowNull:false
        },
        entity_id:{
            type:DataTypes.BIGINT,
            allowNull:false
        },
        action:{
            type:DataTypes.STRING,
            allowNull:false
        },
        detail_json:{
            type:DataTypes.TEXT,
            allowNull:false
        },
        date:{
            type:DataTypes.DATE,
            allowNull:false
        } 
    },{timestamps: false})}