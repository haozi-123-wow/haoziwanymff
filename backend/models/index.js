const { sequelize } = require('../config/db');

// 导入模型
const User = require('./User');
const Setting = require('./Setting');
const Captcha = require('./Captcha');

// 关联关系定义
// User和Setting之间没有直接关联

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
  syncDatabase
};