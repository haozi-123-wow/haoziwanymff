const express = require('express');
const { 
  getSettings, 
  updateSettings, 
  testEmail, 
  getUsers, 
  updateUser 
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

module.exports = router;