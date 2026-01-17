const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '域名 (如: example.com)'
  },
  platform_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '关联的平台配置ID'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  is_public: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否公开(允许用户注册)'
  },
  remarks: {
    type: DataTypes.STRING,
    comment: '备注'
  }
}, {
  tableName: 'domains',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '域名表'
});

module.exports = Domain;
