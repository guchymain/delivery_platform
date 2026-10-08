'use strict';
const { Model } = require('sequelize');
const { RIDER_AVAILABILITY, VEHICLE_TYPES } = require('../src/utils/constants');

module.exports = (sequelize, DataTypes) => {
  class Rider_profiles extends Model {
    static associate(models) {
      Rider_profiles.belongsTo(models.Users, {
        foreignKey: 'userId',
        as: 'user',
        onDelete: 'CASCADE'
      });
    }
  }

  Rider_profiles.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true
    },
    vehicleType: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: VEHICLE_TYPES.MOTORCYCLE,
      validate: {
        isIn: [[
          VEHICLE_TYPES.BICYCLE,
          VEHICLE_TYPES.MOTORCYCLE,
          VEHICLE_TYPES.CAR,
          VEHICLE_TYPES.VAN
        ]]
      }
    },
    plateNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    licenseNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    availabilityStatus: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: RIDER_AVAILABILITY.OFFLINE,
      validate: {
        isIn: [[
          RIDER_AVAILABILITY.AVAILABLE,
          RIDER_AVAILABILITY.BUSY,
          RIDER_AVAILABILITY.OFFLINE
        ]]
      }
    },
    rating: {
      type: DataTypes.DECIMAL(3, 2),
      allowNull: false,
      defaultValue: 5.00
    },
    totalDeliveries: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, {
    sequelize,
    modelName: 'Rider_profiles',
    tableName: 'rider_profiles'
  });

  return Rider_profiles;
};
