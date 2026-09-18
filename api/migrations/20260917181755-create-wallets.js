'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('wallets', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      total_balance: {
        type: Sequelize.DECIMAL,
        allowNull: false 
      },
      withheld_balance: {
        type: Sequelize.DECIMAL,
        allowNull: false
      },
      available_balance: {
        type: Sequelize.DECIMAL,
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
    await queryInterface.dropTable('wallets');
  }
};
