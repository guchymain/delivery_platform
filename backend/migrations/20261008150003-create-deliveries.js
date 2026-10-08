'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('deliveries', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      trackingCode: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      customerId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      riderId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      pickupAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickupContactName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickupContactPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      pickupNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deliveryAddress: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipientName: {
        type: Sequelize.STRING,
        allowNull: false
      },
      recipientPhone: {
        type: Sequelize.STRING,
        allowNull: false
      },
      deliveryNotes: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      packageType: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PARCEL'
      },
      packageWeight: {
        type: Sequelize.DECIMAL(8, 2),
        allowNull: true,
        defaultValue: 1.00
      },
      packageDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      deliveryFee: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 5.00
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING'
      },
      cancellationReason: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pickedUpAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deliveredAt: {
        type: Sequelize.DATE,
        allowNull: true
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

    await queryInterface.addIndex('deliveries', ['trackingCode']);
    await queryInterface.addIndex('deliveries', ['customerId']);
    await queryInterface.addIndex('deliveries', ['riderId']);
    await queryInterface.addIndex('deliveries', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('deliveries');
  }
};
