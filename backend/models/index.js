const { sequelize } = require('../config/db');

// 导入模型
const User = require('./User');
const Setting = require('./Setting');
const Captcha = require('./Captcha');
const PlatformSetting = require('./PlatformSetting');
const Domain = require('./Domain');
const PaymentSetting = require('./PaymentSetting');
const Package = require('./Package');
const UserPackage = require('./UserPackage');
const ParseOrder = require('./ParseOrder');

// 关联关系定义
// PlatformSetting 和 Domain 是一对多关系
PlatformSetting.hasMany(Domain, { foreignKey: 'platform_id', constraints: false });
Domain.belongsTo(PlatformSetting, { foreignKey: 'platform_id', constraints: false });

// Domain 和 Package 是一对多关系
Domain.hasMany(Package, { foreignKey: 'domain_id', constraints: false });
Package.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

// User 和 UserPackage 是一对多关系
User.hasMany(UserPackage, { foreignKey: 'user_id', constraints: false });
UserPackage.belongsTo(User, { foreignKey: 'user_id', constraints: false });

// Package 和 UserPackage 是一对多关系
Package.hasMany(UserPackage, { foreignKey: 'package_id', constraints: false });
UserPackage.belongsTo(Package, { foreignKey: 'package_id', constraints: false });

// Domain 和 UserPackage 是一对多关系
Domain.hasMany(UserPackage, { foreignKey: 'domain_id', constraints: false });
UserPackage.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

// User 和 ParseOrder 是一对多关系
User.hasMany(ParseOrder, { foreignKey: 'user_id', constraints: false });
ParseOrder.belongsTo(User, { foreignKey: 'user_id', constraints: false });

// Domain 和 ParseOrder 是一对多关系
Domain.hasMany(ParseOrder, { foreignKey: 'domain_id', constraints: false });
ParseOrder.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

// UserPackage 和 ParseOrder 是一对多关系
UserPackage.hasMany(ParseOrder, { foreignKey: 'deducted_package_id', constraints: false });
ParseOrder.belongsTo(UserPackage, { foreignKey: 'deducted_package_id', as: 'deductedPackage', constraints: false });

// 同步数据库
const syncDatabase = async () => {
  try {
    await sequelize.sync({ force: false }); // 不强制删除现有表
    console.log('数据库同步成功');
  } catch (error) {
    console.error('数据库同步失败:', error);
  }
};

module.exports = {
  User,
  Setting,
  Captcha,
  PlatformSetting,
  Domain,
  PaymentSetting,
  Package,
  UserPackage,
  ParseOrder,
  sequelize,
  syncDatabase
};