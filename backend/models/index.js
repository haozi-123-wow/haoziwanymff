const { sequelize } = require('../config/db');

// 导入模型
const User = require('./User');
const Setting = require('./Setting');
const Captcha = require('./Captcha');
const PlatformSetting = require('./PlatformSetting');
const Domain = require('./Domain');

// 关联关系定义
// PlatformSetting 和 Domain 是一对多关系
PlatformSetting.hasMany(Domain, { foreignKey: 'platform_id' });
Domain.belongsTo(PlatformSetting, { foreignKey: 'platform_id' });

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
  sequelize,
  syncDatabase
};