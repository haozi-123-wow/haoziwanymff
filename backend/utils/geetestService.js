const axios = require('axios');
const crypto = require('crypto');
const { Captcha, Setting } = require('../models');

/**
 * 获取极验配置
 */
const getGeetestConfig = async () => {
  // 首先尝试从数据库获取配置
  const dbConfig = await Setting.findOne({ where: { key: 'geetestConfig' } });
  
  if (dbConfig) {
    try {
      const config = JSON.parse(dbConfig.value);
      return {
        captchaId: config.captchaId || process.env.GEETEST_CAPTCHA_ID,
        captchaKey: config.captchaKey || process.env.GEETEST_CAPTCHA_KEY,
        apiServer: config.apiServer || process.env.GEETEST_API_SERVER || 'http://gcaptcha4.geetest.com'
      };
    } catch (e) {
      // 如果数据库配置解析失败，回退到环境变量
      return {
        captchaId: process.env.GEETEST_CAPTCHA_ID,
        captchaKey: process.env.GEETEST_CAPTCHA_KEY,
        apiServer: process.env.GEETEST_API_SERVER || 'http://gcaptcha4.geetest.com'
      };
    }
  }
  
  // 使用环境变量
  return {
    captchaId: process.env.GEETEST_CAPTCHA_ID,
    captchaKey: process.env.GEETEST_CAPTCHA_KEY,
    apiServer: process.env.GEETEST_API_SERVER || 'http://gcaptcha4.geetest.com'
  };
};

/**
 * 生成极验验证签名
 */
const generateSignToken = (lotNumber, captchaKey) => {
  const lotnumberBytes = Buffer.from(lotNumber);
  const prikeyBytes = Buffer.from(captchaKey);
  return crypto.createHmac('sha256', prikeyBytes).update(lotnumberBytes).digest('hex');
};

/**
 * 验证极验参数
 */
const validateGeetest = async (params) => {
  const {
    lot_number,
    captcha_output,
    pass_token,
    gen_time
  } = params;

  if (!lot_number || !captcha_output || !pass_token || !gen_time) {
    throw new Error('缺少必要参数');
  }

  const config = await getGeetestConfig();

  // 生成签名
  const sign_token = generateSignToken(lot_number, config.captchaKey);

  // 调用极验验证接口
  const response = await axios.post(
    `${config.apiServer}/validate?captcha_id=${config.captchaId}`,
    {
      lot_number,
      captcha_output,
      pass_token,
      gen_time,
      sign_token
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    }
  );

  const result = response.data;

  if (result.status !== 'success') {
    throw new Error(result.reason || '极验验证失败');
  }

  // 生成内部验证令牌并保存到数据库
  const validateToken = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期

  await Captcha.create({
    token: validateToken,
    expiresAt,
    type: 'geetest'
  });

  return {
    result: result.result,
    validateToken
  };
};

/**
 * 验证内部验证令牌
 */
const verifyValidateToken = async (token) => {
  if (!token) {
    return false;
  }

  const captcha = await Captcha.findOne({
    where: {
      token,
      used: false,
      expiresAt: { [require('sequelize').Op.gt]: new Date() }
    }
  });

  if (!captcha) {
    return false;
  }

  // 标记为已使用
  captcha.used = true;
  await captcha.save();

  return true;
};

module.exports = {
  validateGeetest,
  verifyValidateToken,
  getGeetestConfig
};