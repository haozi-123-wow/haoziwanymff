const express = require('express');
const { getMe } = require('../controllers/authController');

const router = express.Router();

// 获取当前用户信息
router.get('/me', getMe);

module.exports = router;