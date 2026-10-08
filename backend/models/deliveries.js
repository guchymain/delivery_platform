'use strict';
const { Model } = require('sequelize');
const { DELIVERY_STATUS, PACKAGE_TYPES } = require('../src/utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Deliveries extends Model {
    static associate(models) {
      Deliveries.belongsTo(models.Users, {
        foreignKey: 'customerId',
        as: 'customer',
        onDelete: 'CASCADE'
      });

      Deliveries.belongsTo(models.Users, {
        foreignKey: 'riderId',
        as: 'rider',
        onDelete: 'SET NULL'
      });

      Deliveries.hasOne(models.Payments, {
        foreignKey: 'deliveryId',
        as: 'payment',
        onDelete: 'CASCADE'
      });

      Deliveries.hasMany(models.Delivery_status_logs, {
        foreignKey: 'deliveryId',
        as: 'statusLogs',
        onDelete: 'CASCADE'
      });
    }
  }

  Deliveries.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    trackingCode: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    riderId: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    pickupAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupContactName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupContactPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    pickupNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deliveryAddress: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recipientName: {
      type: DataTypes.STRING,
      allowNull: false
    },
    recipientPhone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    deliveryNotes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    packageType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: PACKAGE_TYPES.PARCEL,
      validate: {
        isIn: [[
          PACKAGE_TYPES.DOCUMENTS,
          PACKAGE_TYPES.PARCEL,
          PACKAGE_TYPES.FOOD,
          PACKAGE_TYPES.FRAGILE,
          PACKAGE_TYPES.ELECTRONICS,
          PACKAGE_TYPES.BOX,
          PACKAGE_TYPES.OTHER
        ]]
      }
    },
    packageWeight: {
      type: DataTypes.DECIMAL(8, 2),
      allowNull: true,
      defaultValue: 1.00
    },
    packageDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    deliveryFee: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: DELIVERY_STATUS.PENDING,
      validate: {
        isIn: [[
          DELIVERY_STATUS.PENDING,
          DELIVERY_STATUS.CONFIRMED,
          DELIVERY_STATUS.ASSIGNED,
          DELIVERY_STATUS.PICKED_UP,
          DELIVERY_STATUS.IN_TRANSIT,
          DELIVERY_STATUS.DELIVERED,
          DELIVERY_STATUS.CANCELLED
        ]]
      }
    },
    cancellationReason: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    pickedUpAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deliveredAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Deliveries',
    tableName: 'deliveries'
  });

  return Deliveries;
};
