const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Package = sequelize.define('Package', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  domain_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '关联域名ID'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '套餐名称'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '套餐描述'
  },
  parse_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '解析次数'
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '有效天数'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    comment: '价格'
  },
  original_price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '原价'
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    comment: '是否启用'
  }
}, {
  tableName: 'domain_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '域名套餐表',
  indexes: [
    { fields: ['domain_id'] },
    { fields: ['is_active'] }
  ]
});

module.exports = Package;
