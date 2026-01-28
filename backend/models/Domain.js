const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Domain = sequelize.define('Domain', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  platform_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '关联的平台配置ID'
  },
  domain: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '完整域名 (如: example.com)'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '域名使用价格'
  },
  require_icp: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否需要备案'
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
    type: DataTypes.TEXT,
    comment: '备注'
  }
}, {
  tableName: 'domains',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '域名表（管理员添加的域名）',
  indexes: [
    { unique: true, fields: ['domain'] },
    { fields: ['platform_id'] },
    { fields: ['is_active'] },
    { fields: ['is_public'] }
  ]
});

module.exports = Domain;
