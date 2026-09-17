'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    //4 usuarios
    await queryInterface.bulkInsert('users', [
      { id: 1, email: 'vendedor@test.com', name: 'Vendedor Test', password: '12345',  },
      { id: 2, email: 'comprador1@test.com', name: 'Comprador Uno', password: '12345',  },
      { id: 3, email: 'comprador2@test.com', name: 'Comprador Dos', password: '12345',  },
      { id: 4, email: 'sinfondos@test.com', name: 'Usuario Sin Fondos', password: '12345',  }
    ], {});

    //billeteras vinculadas con los usuarios
    await queryInterface.bulkInsert('wallets', [
      { user_id: 1, total_balance: 0.00, withheld_balance: 0.00, available_balance: 0.00, version: 0,  },
      { user_id: 2, total_balance: 150000.00, withheld_balance: 45000.00, available_balance: 105000.00, version: 0,  },
      { user_id: 3, total_balance: 200000.00, withheld_balance: 0.00, available_balance: 200000.00, version: 0,  },
      { user_id: 4, total_balance: 500.00, withheld_balance: 0.00, available_balance: 500.00, version: 0,  }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('wallets', null, {});
    await queryInterface.bulkDelete('users', null, {});
  }
};
