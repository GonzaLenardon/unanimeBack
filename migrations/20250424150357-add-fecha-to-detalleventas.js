'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('detalleventas', 'fecha', {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.NOW,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('detalleventas', 'fecha');
  },
};
