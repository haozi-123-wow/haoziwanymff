const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Captcha = sequelize.define('Captcha', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.BIGINT
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  },
  used: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  type: {
    type: DataTypes.STRING,
    defaultValue: 'geetest'
  }
}, {
  tableName: 'captchas',
  timestamps: true
});

module.exports = Captcha;