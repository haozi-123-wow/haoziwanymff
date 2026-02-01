const { sequelize } = require('../config/db');

// 导入模型
const User = require('./User');
const Setting = require('./Setting');
const Captcha = require('./Captcha');
const PlatformSetting = require('./PlatformSetting');
const Domain = require('./Domain');
const PaymentSetting = require('./PaymentSetting');
const Package = require('./Package');

// 关联关系定义
// PlatformSetting 和 Domain 是一对多关系
PlatformSetting.hasMany(Domain, { foreignKey: 'platform_id', constraints: false });
Domain.belongsTo(PlatformSetting, { foreignKey: 'platform_id', constraints: false });

// Domain 和 Package 是一对多关系
Domain.hasMany(Package, { foreignKey: 'domain_id', constraints: false });
Package.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

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
  sequelize,
  syncDatabase
};