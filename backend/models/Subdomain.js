const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Subdomain = sequelize.define('Subdomain', {
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
    comment: '对应的域名ID（关联domains表）'
  },
  user_domain_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '用户购买域名ID（关联user_domains表）'
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
  record_type: {
    type: DataTypes.ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV'),
    defaultValue: 'A',
    comment: '解析类型'
  },
  record_value: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '解析记录'
  },
  description: {
    type: DataTypes.TEXT,
    comment: '用途说明（这个解析记录是干什么的）'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive', 'pending', 'banned', 'expired'),
    defaultValue: 'active',
    comment: '状态'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '到期时间'
  },
  remarks: {
    type: DataTypes.STRING,
    comment: '备注'
  }
}, {
  tableName: 'subdomains',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '用户二级域名表',
  indexes: [
    { unique: true, fields: ['full_domain'] },
    { fields: ['user_id'] },
    { fields: ['domain_id'] },
    { fields: ['user_domain_id'] },
    { fields: ['subdomain'] },
    { fields: ['status'] },
    { fields: ['expires_at'] },
    { fields: ['created_at'] }
  ]
});

module.exports = Subdomain;
