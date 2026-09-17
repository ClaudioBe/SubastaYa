'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('auctions', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      seller_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'users', // Tabla física de usuarios
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      category_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'categories', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      description: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url_image: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      base_price: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      min_increase: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      start_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      end_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      state: {
        type: Sequelize.STRING,
        allowNull: false
      },
      version: { 
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('auctions');
  }
};
