const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserDomain = sequelize.define('UserDomain', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    comment: '主键ID'
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户ID'
  },
  domain_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '域名ID（关联domains表）'
  },
  domain_name: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '域名'
  },
  subdomain: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '二级域名'
  },
  full_domain: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '完整域名（二级域名+主域名，如: test.example.com）'
  },
  target_url: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '目标URL'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    comment: '购买价格'
  },
  duration_days: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '有效期天数'
  },
  icp_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已实名认证'
  },
  is_paid: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否已付费'
  },
  paid_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '到期时间'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'banned', 'pending_payment', 'pending_icp'),
    defaultValue: 'active',
    comment: '状态'
  },
  remarks: {
    type: DataTypes.TEXT,
    comment: '备注'
  }
}, {
  tableName: 'user_domains',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '用户购买域名表',
  indexes: [
    { unique: true, fields: ['full_domain'] },
    { fields: ['user_id'] },
    { fields: ['domain_id'] },
    { fields: ['domain_name'] },
    { fields: ['subdomain'] },
    { fields: ['status'] },
    { fields: ['expires_at'] },
    { fields: ['is_paid'] }
  ]
});

module.exports = UserDomain;
