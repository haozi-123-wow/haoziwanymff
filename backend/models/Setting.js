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
  timestamps: true, // 启用时间戳
  createdAt: 'created_at', // 映射到数据库的 created_at 字段
  updatedAt: 'updated_at', // 映射到数据库的 updated_at 字段
  underscored: true // 使用下划线命名法
});

module.exports = Setting;