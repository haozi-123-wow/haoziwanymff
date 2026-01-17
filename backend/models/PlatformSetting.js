const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlatformSetting = sequelize.define('PlatformSetting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '配置名称 (如: 个人阿里云、公司阿里云)'
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '平台类型 (如: aliyun, tencent, cloudflare)'
  },
  access_key_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '阿里云 AccessKey ID / 腾讯云 SecretId / Cloudflare API Token'
  },
  access_key_secret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '阿里云 AccessKey Secret / 腾讯云 SecretKey / Cloudflare Zone ID'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  },
  config: {
    type: DataTypes.JSON,
    defaultValue: {},
    comment: '额外配置 (JSON格式)'
  }
}, {
  tableName: 'platform_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '平台配置表'
});

module.exports = PlatformSetting;
