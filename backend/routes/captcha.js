const express = require('express');
const { getCaptchaConfig, validateCaptcha, issueDevValidateToken } = require('../controllers/captchaController');

const router = express.Router();

// 获取验证配置参数
router.get('/config', getCaptchaConfig);

// 极验二次验证
router.post('/validate', validateCaptcha);

// 开发环境一键获取 validate_token（仅非生产或显式允许时可用）
router.post('/dev/validate-token', issueDevValidateToken);

module.exports = router;
