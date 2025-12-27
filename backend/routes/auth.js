const express = require('express');
const { register, activateAccount, login, logout } = require('../controllers/authController');

const router = express.Router();

// 用户注册
router.post('/register', register);

// 用户激活账户
router.get('/activate/:token', activateAccount);

// 用户登录
router.post('/login', login);

// 用户登出
router.post('/logout', logout);

module.exports = router;