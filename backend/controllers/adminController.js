const { User, Setting } = require('../models');
const { sendTestEmail } = require('../utils/emailService');
const { verifyValidateToken } = require('../utils/geetestService');
const { getUploadedFiles } = require('../middleware/upload');
const { Op } = require('sequelize');

const DEFAULT_REGISTER_CONFIG = {
  allowRegister: true,
  needActivation: true,
  needCaptcha: true
};

const DEFAULT_SMTP_CONFIG = {
  host: '',
  port: 587,
  secure: false,
  user: '',
  pass: '',
  from: ''
};

const DEFAULT_GEETEST_CONFIG = {
  captchaId: '',
  captchaKey: '',
  needCaptcha: true
};

const DEFAULT_SETTINGS_MAP = {
  siteName: '',
  siteTitle: '',
  siteDescription: '',
  siteKeywords: '',
  siteAnnouncement: '',
  siteLogo: '',
  siteFavicon: '',
  loginLogo: '',
  adminQQ: '',
  qqGroupLink: '',
  registerConfig: DEFAULT_REGISTER_CONFIG,
  smtpConfig: DEFAULT_SMTP_CONFIG,
  geetestConfig: DEFAULT_GEETEST_CONFIG
};

const isPlainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

const cloneValue = (value) => {
  if (Array.isArray(value)) {
    return value.map(cloneValue);
  }
  if (isPlainObject(value)) {
    return Object.keys(value).reduce((acc, key) => {
      acc[key] = cloneValue(value[key]);
      return acc;
    }, {});
  }
  return value;
};

const buildDefaultSettings = () =>
  Object.keys(DEFAULT_SETTINGS_MAP).reduce((acc, key) => {
    acc[key] = cloneValue(DEFAULT_SETTINGS_MAP[key]);
    return acc;
  }, {});

const safeParseSettingValue = (rawValue, fallback) => {
  if (rawValue === undefined || rawValue === null) {
    return cloneValue(fallback);
  }
  if (typeof rawValue === 'object') {
    return rawValue;
  }
  const normalized = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
  if (normalized === '' || normalized === undefined || normalized === null) {
    return cloneValue(fallback);
  }
  try {
    return JSON.parse(normalized);
  } catch (error) {
    return normalized;
  }
};

const mergeObjectConfig = (value, fallback) => {
  if (!isPlainObject(fallback)) {
    return value === undefined ? fallback : value;
  }
  if (!isPlainObject(value)) {
    return cloneValue(fallback);
  }
  return {
    ...fallback,
    ...value
  };
};

/**
 * 获取网站设置
 */
const getSettings = async (req, res) => {
  try {
    const settings = await Setting.findAll();
    const normalizedSettings = buildDefaultSettings();

    let earliestCreatedAt = null;
    let latestUpdatedAt = null;

    settings.forEach((setting) => {
      const { key, value, createdAt, updatedAt } = setting;
      const hasDefault = Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS_MAP, key);
      const fallback = hasDefault ? DEFAULT_SETTINGS_MAP[key] : undefined;
      const parsedValue = safeParseSettingValue(value, fallback);

      if (hasDefault && isPlainObject(fallback)) {
        normalizedSettings[key] = mergeObjectConfig(parsedValue, fallback);
      } else if (hasDefault) {
        normalizedSettings[key] = parsedValue;
      } else {
        normalizedSettings[key] = parsedValue;
      }

      if (createdAt && (!earliestCreatedAt || createdAt < earliestCreatedAt)) {
        earliestCreatedAt = createdAt;
      }
      if (updatedAt && (!latestUpdatedAt || updatedAt > latestUpdatedAt)) {
        latestUpdatedAt = updatedAt;
      }
    });

    res.json({
      code: 0,
      message: 'success',
      data: {
        ...normalizedSettings,
        createdAt: earliestCreatedAt,
        updatedAt: latestUpdatedAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取网站设置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 更新网站设置
 */
const updateSettings = async (req, res) => {
  try {
    const uploadedFiles = getUploadedFiles(req);
    
    const {
      siteName,
      siteTitle,
      siteDescription,
      siteKeywords,
      siteAnnouncement,
      siteLogo,
      siteFavicon,
      loginLogo,
      adminQQ,
      qqGroupLink,
      registerConfig,
      smtpConfig,
      geetestConfig
    } = req.body;

    if (siteName !== undefined) {
      await Setting.upsert({
        key: 'siteName',
        value: JSON.stringify(siteName),
        description: '网站名称',
        type: 'general'
      });
    }

    if (siteTitle !== undefined) {
      await Setting.upsert({
        key: 'siteTitle',
        value: JSON.stringify(siteTitle),
        description: '网站标题',
        type: 'general'
      });
    }

    if (siteDescription !== undefined) {
      await Setting.upsert({
        key: 'siteDescription',
        value: JSON.stringify(siteDescription),
        description: '网站描述',
        type: 'general'
      });
    }

    if (siteKeywords !== undefined) {
      await Setting.upsert({
        key: 'siteKeywords',
        value: JSON.stringify(siteKeywords),
        description: '网站关键词',
        type: 'general'
      });
    }

    if (siteAnnouncement !== undefined) {
      await Setting.upsert({
        key: 'siteAnnouncement',
        value: JSON.stringify(siteAnnouncement),
        description: '网站公告',
        type: 'general'
      });
    }

    if (uploadedFiles.siteLogo || siteLogo !== undefined) {
      await Setting.upsert({
        key: 'siteLogo',
        value: JSON.stringify(uploadedFiles.siteLogo || siteLogo),
        description: '网站Logo URL',
        type: 'general'
      });
    }

    if (uploadedFiles.siteFavicon || siteFavicon !== undefined) {
      await Setting.upsert({
        key: 'siteFavicon',
        value: JSON.stringify(uploadedFiles.siteFavicon || siteFavicon),
        description: '网站Favicon URL',
        type: 'general'
      });
    }

    if (uploadedFiles.loginLogo || loginLogo !== undefined) {
      await Setting.upsert({
        key: 'loginLogo',
        value: JSON.stringify(uploadedFiles.loginLogo || loginLogo),
        description: '登录页Logo URL',
        type: 'general'
      });
    }

    if (adminQQ !== undefined) {
      await Setting.upsert({
        key: 'adminQQ',
        value: JSON.stringify(adminQQ),
        description: '站长QQ',
        type: 'general'
      });
    }

    if (qqGroupLink !== undefined) {
      await Setting.upsert({
        key: 'qqGroupLink',
        value: JSON.stringify(qqGroupLink),
        description: 'QQ群链接',
        type: 'general'
      });
    }

    if (registerConfig) {
      await Setting.upsert({
        key: 'registerConfig',
        value: JSON.stringify(registerConfig),
        description: '注册配置',
        type: 'general'
      });
    }

    if (smtpConfig) {
      await Setting.upsert({
        key: 'smtpConfig',
        value: JSON.stringify(smtpConfig),
        description: 'SMTP配置',
        type: 'email'
      });
    }
    
    if (geetestConfig) {
      await Setting.upsert({
        key: 'geetestConfig',
        value: JSON.stringify(geetestConfig),
        description: '极验验证配置',
        type: 'geetest'
      });
    }

    res.json({
      code: 0,
      message: '网站设置更新成功',
      data: {
        siteName,
        siteTitle,
        siteDescription,
        updatedAt: new Date()
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新网站设置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 测试邮件配置
 */
const testEmail = async (req, res) => {
  try {
    const { validate_token } = req.body;
    
    // 验证人机验证令牌
    const isValidCaptcha = await verifyValidateToken(validate_token);
    if (!isValidCaptcha) {
      return res.status(400).json({
        code: 1002,
        message: '人机验证未通过，请重新验证',
        data: null,
        timestamp: Date.now()
      });
    }

    const { to, subject = '测试邮件', content = '这是一封测试邮件' } = req.body;

    if (!to) {
      return res.status(400).json({
        code: 1001,
        message: '缺少收件人邮箱',
        data: null,
        timestamp: Date.now()
      });
    }

    // 获取SMTP配置
    const smtpSetting = await Setting.findOne({ where: { key: 'smtpConfig' } });
    let smtpConfig = null;
    
    if (smtpSetting) {
      try {
        smtpConfig = JSON.parse(smtpSetting.value);
      } catch (e) {
        console.error('解析SMTP配置失败:', e);
      }
    }

    // 如果有数据库中的SMTP配置，则使用它，否则使用环境变量
    if (smtpConfig) {
      // 使用数据库中的配置发送邮件
      const transporter = require('nodemailer').createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: {
          user: smtpConfig.user,
          pass: smtpConfig.pass
        }
      });
      
      const mailOptions = {
        from: `"${smtpConfig.from || 'Haoziwanymff'}" <${smtpConfig.user}>`,
        to,
        subject,
        text: content
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        console.log('测试邮件发送成功:', info.messageId);
        
        res.json({
          code: 0,
          message: '测试邮件发送成功',
          data: {
            messageId: info.messageId
          },
          timestamp: Date.now()
        });
      } catch (emailError) {
        console.error('发送测试邮件错误:', emailError);
        res.status(500).json({
          code: 5000,
          message: `邮件发送失败: ${emailError.message}`,
          data: null,
          timestamp: Date.now()
        });
      }
    } else {
      // 使用环境变量配置发送邮件
      const result = await sendTestEmail(to, subject, content);
      
      res.json({
        code: 0,
        message: '测试邮件发送成功',
        data: {
          messageId: result.messageId
        },
        timestamp: Date.now()
      });
    }
  } catch (error) {
    console.error('发送测试邮件错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '邮件发送失败',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 获取用户列表
 */
const getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const whereCondition = {};
    if (keyword) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] }, // 排除密码字段
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: limit
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 更新用户状态
 */
const updateUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isBanned, banReason } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 1005,
        message: '用户不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 更新激活状态
    if (isActive !== undefined) {
      user.isActive = isActive;
    }

    // 更新封禁状态
    if (isBanned !== undefined) {
      user.isBanned = isBanned;
      // 如果封禁用户，必须有封禁原因
      if (isBanned === true && !banReason) {
        return res.status(400).json({
          code: 1001,
          message: '封禁用户时必须提供封禁原因',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    // 更新封禁原因
    if (banReason !== undefined) {
      user.banReason = banReason;
    }

    await user.save();

    res.json({
      code: 0,
      message: '用户状态更新成功',
      data: {
        userId: user.id,
        isActive: user.isActive,
        isBanned: user.isBanned,
        banReason: user.banReason
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  testEmail,
  getUsers,
  updateUserStatus
};