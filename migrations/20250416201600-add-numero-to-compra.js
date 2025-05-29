'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('compras', 'numero', {
      type: Sequelize.STRING,
      allowNull: true, // Si querés permitir null por ahora
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Compras', 'numero');
  },
};
