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
    allowNull: false,
    comment: 'AccessKey ID'
  },
  access_key_secret: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: 'AccessKey Secret'
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
