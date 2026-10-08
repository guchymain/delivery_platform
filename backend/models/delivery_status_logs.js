'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Delivery_status_logs extends Model {
    static associate(models) {
      Delivery_status_logs.belongsTo(models.Deliveries, {
        foreignKey: 'deliveryId',
        as: 'delivery',
        onDelete: 'CASCADE'
      });

      Delivery_status_logs.belongsTo(models.Users, {
        foreignKey: 'changedBy',
        as: 'actor',
        onDelete: 'CASCADE'
      });
    }
  }

  Delivery_status_logs.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    deliveryId: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false
    },
    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Delivery_status_logs',
    tableName: 'delivery_status_logs'
  });

  return Delivery_status_logs;
};
