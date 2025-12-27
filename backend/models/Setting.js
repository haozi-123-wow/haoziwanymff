const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  key: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  value: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'general' // general, email, geetest, etc.
  }
}, {
  tableName: 'settings',
  timestamps: true
});

module.exports = Setting;