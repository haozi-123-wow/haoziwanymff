const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const UserPackage = sequelize.define('UserPackage', {
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
  package_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '套餐ID'
  },
  domain_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '域名ID'
  },
  total_count: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '总解析次数'
  },
  used_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    comment: '已使用次数'
  },
  valid_start: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '有效期开始'
  },
  valid_end: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '有效期结束'
  },
  status: {
    type: DataTypes.ENUM('active', 'expired'),
    defaultValue: 'active',
    comment: '状态'
  }
}, {
  tableName: 'user_packages',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  underscored: true,
  comment: '用户套餐表',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['domain_id'] },
    { fields: ['package_id'] },
    { fields: ['status'] },
    { fields: ['valid_end'] }
  ]
});

module.exports = UserPackage;
