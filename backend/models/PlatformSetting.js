const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PlatformSetting = sequelize.define('PlatformSetting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  platform: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    comment: '平台名称 (如: aliyun, tencent)'
  },
  access_key_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '阿里云 AccessKey ID / 腾讯云 SecretId'
  },
  access_key_secret: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '阿里云 AccessKey Secret / 腾讯云 SecretKey'
  },
  secret_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '腾讯云 SecretId (兼容字段)'
  },
  secret_key: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '腾讯云 SecretKey (兼容字段)'
  },
  api_token: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudflare API Token (兼容字段，推荐使用 access_key_id)'
  },
  zone_id: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: 'Cloudflare Zone ID (兼容字段，推荐使用 access_key_secret)'
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
