const express = require('express');
const {
  getSettings,
  updateSettings,
  testEmail,
  getUsers,
  updateUser,
  getPlatformSettings,
  addPlatformSetting,
  updatePlatformSetting,
  deletePlatformSetting,
  updatePlatformSettingStatus,
  getDomainsByPlatformSetting,
  getDomainList,
  addDomain,
  deleteDomain,
  getDomainRecords,
  deleteDomainRecord,
  addDomainRecord,
  modifyDomainRecord
} = require('../controllers/adminController');
const { uploadFields, handleUploadError } = require('../middleware/upload');

const router = express.Router();

// 获取网站设置
router.get('/settings', getSettings);

// 更新网站设置（支持文件上传）
router.put('/settings', uploadFields, handleUploadError, updateSettings);

// 测试邮件配置
router.post('/test-email', testEmail);

// 获取用户列表
router.get('/users', getUsers);

// 更新用户信息（状态和资料）
router.put('/users/:userId', updateUser);

// ==================== 云平台配置管理 ====================

// 获取云平台配置列表
router.get('/platform-settings', getPlatformSettings);

// 添加云平台配置
router.post('/platform-settings', addPlatformSetting);

// 更新云平台配置
router.put('/platform-settings/:id', updatePlatformSetting);

// 删除云平台配置
router.delete('/platform-settings/:id', deletePlatformSetting);

// 启用/禁用云平台配置
router.patch('/platform-settings/:id/status', updatePlatformSettingStatus);

// 通过云平台配置获取域名列表
router.get('/platform-settings/:id/domains', getDomainsByPlatformSetting);

// ==================== 域名管理 ====================

// 获取域名列表（本地数据库）
router.get('/domains', getDomainList);

// 添加域名
router.post('/domains', addDomain);

// 删除域名
router.delete('/domains/:domainId', deleteDomain);

// 获取域名解析记录列表
router.get('/domains/:domainId/records', getDomainRecords);

// 新增域名解析记录
router.post('/domains/:domainId/records', addDomainRecord);

// 修改域名解析记录
router.put('/domains/:domainId/records/:recordId', modifyDomainRecord);

// 删除域名解析记录
router.delete('/domains/:domainId/records/:recordId', deleteDomainRecord);

module.exports = router;