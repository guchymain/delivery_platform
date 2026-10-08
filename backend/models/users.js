'use strict';
const { Model } = require('sequelize');
const { USER_ROLES, ACCOUNT_STATUS } = require('../src/utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    static associate(models) {
      Users.hasOne(models.Rider_profiles, {
        foreignKey: 'userId',
        as: 'riderProfile',
        onDelete: 'CASCADE'
      });

      Users.hasMany(models.Deliveries, {
        foreignKey: 'customerId',
        as: 'customerDeliveries',
        onDelete: 'CASCADE'
      });

      Users.hasMany(models.Deliveries, {
        foreignKey: 'riderId',
        as: 'assignedDeliveries',
        onDelete: 'SET NULL'
      });

      Users.hasMany(models.Payments, {
        foreignKey: 'userId',
        as: 'payments',
        onDelete: 'CASCADE'
      });

      Users.hasMany(models.Delivery_status_logs, {
        foreignKey: 'changedBy',
        as: 'statusChanges',
        onDelete: 'CASCADE'
      });
    }

    toJSON() {
      const values = { ...this.get() };
      delete values.password;
      return values;
    }
  }

  Users.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: USER_ROLES.CUSTOMER,
      validate: {
        isIn: [[USER_ROLES.CUSTOMER, USER_ROLES.RIDER, USER_ROLES.ADMIN]]
      }
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: ACCOUNT_STATUS.ACTIVE,
      validate: {
        isIn: [[ACCOUNT_STATUS.ACTIVE, ACCOUNT_STATUS.INACTIVE, ACCOUNT_STATUS.SUSPENDED]]
      }
    }
  }, {
    sequelize,
    modelName: 'Users',
    tableName: 'users'
  });

  return Users;
};
