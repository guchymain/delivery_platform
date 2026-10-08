'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('rider_profiles', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      vehicleType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'MOTORCYCLE'
      },
      plateNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      licenseNumber: {
        type: Sequelize.STRING,
        allowNull: true
      },
      availabilityStatus: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'OFFLINE'
      },
      rating: {
        type: Sequelize.DECIMAL(3, 2),
        allowNull: false,
        defaultValue: 5.00
      },
      totalDeliveries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('rider_profiles', ['userId']);
    await queryInterface.addIndex('rider_profiles', ['availabilityStatus']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('rider_profiles');
  }
};
