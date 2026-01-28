const { sequelize } = require('../config/db');

// 导入模型
const User = require('./User');
const Setting = require('./Setting');
const Captcha = require('./Captcha');
const PlatformSetting = require('./PlatformSetting');
const Domain = require('./Domain');
const UserDomain = require('./UserDomain');
const Subdomain = require('./Subdomain');

// 关联关系定义
// PlatformSetting 和 Domain 是一对多关系
PlatformSetting.hasMany(Domain, { foreignKey: 'platform_id', constraints: false });
Domain.belongsTo(PlatformSetting, { foreignKey: 'platform_id', constraints: false });

// User 和 UserDomain 是一对多关系
User.hasMany(UserDomain, { foreignKey: 'user_id', constraints: false });
UserDomain.belongsTo(User, { foreignKey: 'user_id', constraints: false });

// Domain 和 UserDomain 是一对多关系
Domain.hasMany(UserDomain, { foreignKey: 'domain_id', constraints: false });
UserDomain.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

// Domain 和 Subdomain 是一对多关系
Domain.hasMany(Subdomain, { foreignKey: 'domain_id', constraints: false });
Subdomain.belongsTo(Domain, { foreignKey: 'domain_id', constraints: false });

// User 和 Subdomain 是一对多关系
User.hasMany(Subdomain, { foreignKey: 'user_id', constraints: false });
Subdomain.belongsTo(User, { foreignKey: 'user_id', constraints: false });

// UserDomain 和 Subdomain 是一对多关系
UserDomain.hasMany(Subdomain, { foreignKey: 'user_domain_id', constraints: false });
Subdomain.belongsTo(UserDomain, { foreignKey: 'user_domain_id', constraints: false });

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
  UserDomain,
  Subdomain,
  sequelize,
  syncDatabase
};