const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const PaymentSetting = sequelize.define('PaymentSetting', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    comment: '支付方式 (alipay/wechat/epay)'
  },
  payment_name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '支付方式名称'
  },
  config_data: {
    type: DataTypes.JSON,
    allowNull: false,
    comment: '配置数据 (JSON对象)'
  },
  is_enabled: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否启用'
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '排序顺序'
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '配置描述'
  }
}, {
  tableName: 'payment_settings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '支付配置表'
});

module.exports = PaymentSetting;
