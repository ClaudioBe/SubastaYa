'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      { id: 1, name: 'Tecnología',  },
      { id: 2, name: 'Coleccionables',  },
      { id: 3, name: 'Indumentaria',  },
      { id: 4, name: 'Vehículos',  }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
