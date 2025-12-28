const express = require('express');
const { getMe, updateEmail } = require('../controllers/authController');

const router = express.Router();

// 获取当前用户信息
router.get('/me', getMe);

// 修改绑定邮箱
router.patch('/email', updateEmail);

module.exports = router;
