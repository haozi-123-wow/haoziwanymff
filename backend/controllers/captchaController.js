const crypto = require('crypto');
const { Captcha } = require('../models');
const { validateGeetest, getGeetestConfig } = require('../utils/geetestService');

/**
 * 获取验证配置参数
 */
const getCaptchaConfig = async (req, res) => {
  try {
    const config = await getGeetestConfig();

    res.json({
      code: 0,
      message: 'success',
      data: {
        captchaId: config.captchaId,
        apiServer: config.apiServer,
        timestamp: Date.now()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(500).json({
      code: 5000,
      message: error.message || '获取极验配置失败',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 极验二次验证
 */
const validateCaptcha = async (req, res) => {
  try {
    const { lot_number, captcha_output, pass_token, gen_time } = req.body;

    if (!lot_number || !captcha_output || !pass_token || !gen_time) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数',
        data: null,
        timestamp: Date.now()
      });
    }

    const result = await validateGeetest({
      lot_number,
      captcha_output,
      pass_token,
      gen_time
    });

    res.json({
      code: 0,
      message: '验证通过',
      data: {
        result: result.result,
        validate_token: result.validateToken
      },
      timestamp: Date.now()
    });
  } catch (error) {
    res.status(400).json({
      code: 1002,
      message: error.message || '人机验证失败',
      data: {
        result: 'fail',
        reason: error.message
      },
      timestamp: Date.now()
    });
  }
};

/**
 * 开发环境：直接签发 validate_token 便于调试
 */
const issueDevValidateToken = async (req, res) => {
  try {
    const allowDevEndpoint = (process.env.NODE_ENV || 'development') !== 'production'
      || process.env.ALLOW_DEV_CAPTCHA === 'true';

    if (!allowDevEndpoint) {
      return res.status(403).json({
        code: 1002,
        message: '生产环境禁止使用开发调试接口',
        data: null,
        timestamp: Date.now()
      });
    }

    const expiresInMinutes = Math.min(
      Math.max(parseInt(req.body?.expiresInMinutes || '10', 10), 1),
      60
    );

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);

    await Captcha.create({
      token,
      expiresAt,
      used: false,
      type: 'geetest'
    });

    res.json({
      code: 0,
      message: '开发环境 validate_token 生成成功',
      data: {
        validate_token: token,
        expiresInMinutes
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('issueDevValidateToken error:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '生成验证令牌失败',
      data: null,
      timestamp: Date.now()
    });
  }
};

module.exports = {
  getCaptchaConfig,
  validateCaptcha,
  issueDevValidateToken
};
