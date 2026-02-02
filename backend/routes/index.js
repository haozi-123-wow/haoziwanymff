const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const authRoutes = require('./auth');
const captchaRoutes = require('./captcha');
const userRoutes = require('./user');
const adminRoutes = require('./admin');
const domainRoutes = require('./domain');
const orderRoutes = require('./order');

const router = express.Router();

// 极验验证路由
router.use('/captcha', captchaRoutes);

// 认证相关路由
router.use('/auth', authRoutes);

// 用户相关路由（需要认证）
router.use('/user', authenticateToken, userRoutes);

// 管理员相关路由（需要管理员权限）
router.use('/admin', authenticateToken, requireAdmin, adminRoutes);

// 域名相关路由（需要认证）
router.use('/domains', authenticateToken, domainRoutes);

// 订单相关路由（需要认证）
router.use('/api/v1', orderRoutes);

module.exports = router;