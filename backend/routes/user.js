const express = require('express');
const { getMe, updateEmail, updateProfile } = require('../controllers/authController');
const { checkUserPackageStatus } = require('../controllers/packageController');

const router = express.Router();

// 获取当前用户信息
router.get('/me', getMe);

// 修改绑定邮箱
router.patch('/email', updateEmail);

// 更改用户资料
router.patch('/profile', updateProfile);

// 检查用户套餐状态
router.get('/packages/check', checkUserPackageStatus);

module.exports = router;
