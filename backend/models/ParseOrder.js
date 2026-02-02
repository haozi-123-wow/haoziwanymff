const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const ParseOrder = sequelize.define('ParseOrder', {
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
  order_no: {
    type: DataTypes.STRING(32),
    allowNull: false,
    unique: true,
    comment: '订单号'
  },
  domain_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '域名ID'
  },
  website_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '网站名称'
  },
  hostname: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '主机名'
  },
  full_hostname: {
    type: DataTypes.STRING(200),
    allowNull: false,
    comment: '完整主机名'
  },
  record_type: {
    type: DataTypes.ENUM('A', 'CNAME', 'AAAA'),
    allowNull: false,
    comment: '解析类型'
  },
  record_value: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '解析记录值'
  },
  ttl: {
    type: DataTypes.INTEGER,
    defaultValue: 600,
    comment: 'TTL值'
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0.00,
    comment: '订单金额'
  },
  deduct_package: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    comment: '是否使用套餐抵扣'
  },
  deducted_package_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
    comment: '抵扣的套餐ID'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paying', 'paid', 'reviewing', 'active', 'rejected', 'cancelled', 'expired'),
    defaultValue: 'pending',
    comment: '订单状态'
  },
  remark: {
    type: DataTypes.STRING(200),
    allowNull: true,
    comment: '备注'
  },
  review_remark: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '审核备注'
  },
  cloud_record_id: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '云平台记录ID'
  },
  payment_method: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '支付方式'
  },
  payment_time: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '支付时间'
  },
  expires_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '过期时间'
  },
  reviewed_at: {
    type: DataTypes.DATE,
    allowNull: true,
    comment: '审核时间'
  }
}, {
  tableName: 'parse_orders',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '解析订单表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['order_no'], unique: true },
    { fields: ['domain_id'] },
    { fields: ['status'] },
    { fields: ['created_at'] },
    { fields: ['expires_at'] }
  ]
});

module.exports = ParseOrder;
