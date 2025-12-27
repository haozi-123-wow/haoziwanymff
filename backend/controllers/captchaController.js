const { validateGeetest } = require('../utils/geetestService');

/**
 * 获取验证配置参数
 */
const getCaptchaConfig = (req, res) => {
  res.json({
    code: 0,
    message: 'success',
    data: {
      captchaId: process.env.GEETEST_CAPTCHA_ID,
      timestamp: Date.now()
    },
    timestamp: Date.now()
  });
};

/**
 * 极验二次验证
 */
const validateCaptcha = async (req, res) => {
  try {
    const { lot_number, captcha_output, pass_token, gen_time } = req.body;

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

module.exports = {
  getCaptchaConfig,
  validateCaptcha
};