const express = require('express');
const { register, activateAccount, login, logout, sendEmailCode, resetPassword } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 用户注册
router.post('/register', register);

// 用户激活账户（支持路径或查询参数传递 token）
router.get('/activate/:token?', activateAccount);

// 用户登录
router.post('/login', login);

// 发送邮箱验证码
router.post('/email-code', sendEmailCode);

// 找回密码
router.post('/reset-password', resetPassword);

// 用户登出
router.post('/logout', authenticateToken, logout);

module.exports = router;
