const express = require('express');
const { getCaptchaConfig, validateCaptcha } = require('../controllers/captchaController');

const router = express.Router();

// 获取验证配置参数
router.get('/config', getCaptchaConfig);

// 极验二次验证
router.post('/validate', validateCaptcha);

module.exports = router;