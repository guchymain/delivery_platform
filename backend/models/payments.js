'use strict';
const { Model } = require('sequelize');
const { PAYMENT_METHODS, PAYMENT_STATUS } = require('../src/utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    static associate(models) {
      Payments.belongsTo(models.Deliveries, {
        foreignKey: 'deliveryId',
        as: 'delivery',
        onDelete: 'CASCADE'
      });

      Payments.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }

  Payments.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    paymentMethod: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: PAYMENT_METHODS.CASH,
      validate: {
        isIn: [[
          PAYMENT_METHODS.CASH,
          PAYMENT_METHODS.CARD,
          PAYMENT_METHODS.TRANSFER
        ]]
      }
    },
    paymentStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: PAYMENT_STATUS.PENDING,
      validate: {
        isIn: [[
          PAYMENT_STATUS.PENDING,
          PAYMENT_STATUS.SUCCESSFUL,
          PAYMENT_STATUS.FAILED,
          PAYMENT_STATUS.REFUNDED
        ]]
      }
    },
    transactionReference: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    paidAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    refundedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Payments',
    tableName: 'payments'
  });

  Payments.prototype.toJSON = function () {
    const values = { ...this.get() };
    values.status = values.paymentStatus;
    values.payment_status = values.paymentStatus;
    values.method = values.paymentMethod;
    values.payment_method = values.paymentMethod;
    values.transaction_reference = values.transactionReference;
    return values;
  };

  return Payments;
};
