const { User, Setting, PlatformSetting, Domain, PaymentSetting, sequelize } = require('../models');
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
 * 更新用户信息（状态和资料）
 */
const updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive, isBanned, banReason, username, email } = req.body;

    // 至少提供一个需要修改的字段
    if (isActive === undefined && isBanned === undefined && banReason === undefined && !username && !email) {
      return res.status(400).json({
        code: 1001,
        message: '请提供至少一个需要修改的字段',
        data: null,
        timestamp: Date.now()
      });
    }

    // 不能修改自己的资料
    if (req.user && req.user.id === userId) {
      return res.status(400).json({
        code: 1001,
        message: '不能修改自己的资料',
        data: null,
        timestamp: Date.now()
      });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        code: 1005,
        message: '用户不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizeEmail = (email = '') => email.trim().toLowerCase();

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

    // 检查用户名格式
    if (username) {
      const sanitizedUsername = typeof username === 'string' ? username.trim() : '';
      if (!usernamePattern.test(sanitizedUsername)) {
        return res.status(400).json({
          code: 1001,
          message: '用户名需为3-20位字母、数字或下划线',
          data: null,
          timestamp: Date.now()
        });
      }

      // 检查用户名是否已被使用（排除自己）
      if (sanitizedUsername !== user.username) {
        const existingUser = await User.findOne({
          where: {
            username: sanitizedUsername,
            id: { [Op.ne]: user.id }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            code: 1004,
            message: '该用户名已被使用',
            data: null,
            timestamp: Date.now()
          });
        }

        user.username = sanitizedUsername;
      }
    }

    // 检查邮箱格式
    if (email) {
      const sanitizedEmail = normalizeEmail(email);
      if (!emailPattern.test(sanitizedEmail)) {
        return res.status(400).json({
          code: 1001,
          message: '请输入合法的邮箱地址',
          data: null,
          timestamp: Date.now()
        });
      }

      // 检查邮箱是否已被使用（排除自己）
      if (sanitizedEmail !== normalizeEmail(user.email)) {
        const existingUser = await User.findOne({
          where: {
            email: sanitizedEmail,
            id: { [Op.ne]: user.id }
          }
        });

        if (existingUser) {
          return res.status(400).json({
            code: 1004,
            message: '该邮箱已被注册',
            data: null,
            timestamp: Date.now()
          });
        }

        user.email = sanitizedEmail;
      }
    }

    await user.save();

    res.json({
      code: 0,
      message: '用户信息更新成功',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        isBanned: user.isBanned,
        banReason: user.banReason,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新用户信息错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 获取云平台配置列表
 */
const getPlatformSettings = async (req, res) => {
  try {
    const { platform, isActive, page = 1, pageSize = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // 构建查询条件
    const whereCondition = {};
    if (platform) {
      whereCondition.platform = platform;
    }
    if (isActive !== undefined) {
      whereCondition.is_active = isActive === 'true';
    }

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // 验证排序字段
    const allowedSortFields = ['createdAt', 'updatedAt', 'platform', 'name'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    // 映射排序字段（从 camelCase 到 snake_case）
    const sortFieldMap = {
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'platform': 'platform',
      'name': 'name'
    };
    const dbSortField = sortFieldMap[sortField] || 'created_at';

    const { count, rows } = await PlatformSetting.findAndCountAll({
      where: whereCondition,
      attributes: [
        'id',
        'name',
        'platform',
        'access_key_id',
        'is_active',
        'config',
        'created_at',
        'updated_at'
      ], // 明确指定要返回的字段，排除敏感字段
      offset,
      limit,
      order: [[dbSortField, sortDirection]]
    });

    // 为每个配置添加域名数量统计
    const platformIds = rows.map(p => p.id);
    const domainCounts = await Domain.findAll({
      attributes: ['platform_id', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      where: { platform_id: platformIds },
      group: ['platform_id'],
      raw: true
    });

    // 将域名数量映射到配置列表
    const domainCountMap = {};
    domainCounts.forEach(item => {
      domainCountMap[item.platform_id] = item.count;
    });

    // 转换字段名并添加脱敏信息
    const processedRows = rows.map(setting => {
      const settingData = setting.toJSON();

      // 将 snake_case 转换为 camelCase
      const camelCaseData = {
        id: settingData.id,
        name: settingData.name,
        platform: settingData.platform,
        accessKeyId: settingData.access_key_id ? settingData.access_key_id.substring(0, 8) + '***' : null,
        isActive: settingData.is_active,
        config: settingData.config,
        createdAt: settingData.created_at,
        updatedAt: settingData.updated_at,
        domainCount: domainCountMap[settingData.id] || 0
      };

      return camelCaseData;
    });

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: processedRows,
        total: count,
        page: parseInt(page),
        pageSize: limit
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取云平台配置列表错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 添加云平台配置
 */
const addPlatformSetting = async (req, res) => {
  try {
    const { name, platform, accessKeyId, accessKeySecret, isActive = false } = req.body;

    // 验证必填字段
    if (!name) {
      return res.status(400).json({
        code: 1001,
        message: '请提供配置名称',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!platform) {
      return res.status(400).json({
        code: 1001,
        message: '请选择平台类型',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证平台类型
    const allowedPlatforms = ['aliyun', 'tencent', 'cloudflare'];
    if (!allowedPlatforms.includes(platform)) {
      return res.status(400).json({
        code: 1001,
        message: '不支持的平台类型',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!accessKeyId) {
      return res.status(400).json({
        code: 1001,
        message: '请提供密钥ID',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!accessKeySecret) {
      return res.status(400).json({
        code: 1001,
        message: '请提供密钥',
        data: null,
        timestamp: Date.now()
      });
    }

    // 创建配置
    const setting = await PlatformSetting.create({
      name,
      platform,
      access_key_id: accessKeyId,
      access_key_secret: accessKeySecret,
      is_active: isActive
    });

    res.json({
      code: 0,
      message: '云平台配置添加成功',
      data: {
        id: setting.id,
        name: setting.name,
        platform: setting.platform,
        accessKeyId: setting.access_key_id.substring(0, 8) + '***',
        isActive: setting.is_active,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('添加云平台配置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 更新云平台配置
 */
const updatePlatformSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, accessKeyId, accessKeySecret, isActive } = req.body;

    // 验证是否至少提供一个字段
    if (name === undefined && accessKeyId === undefined && accessKeySecret === undefined && isActive === undefined) {
      return res.status(400).json({
        code: 1001,
        message: '请提供至少一个需要修改的字段',
        data: null,
        timestamp: Date.now()
      });
    }

    const setting = await PlatformSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '云平台配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 更新字段
    if (name !== undefined) {
      setting.name = name;
    }
    if (accessKeyId !== undefined) {
      setting.access_key_id = accessKeyId;
    }
    if (accessKeySecret !== undefined) {
      setting.access_key_secret = accessKeySecret;
    }
    if (isActive !== undefined) {
      setting.is_active = isActive;
    }

    await setting.save();

    res.json({
      code: 0,
      message: '云平台配置更新成功',
      data: {
        id: setting.id,
        name: setting.name,
        platform: setting.platform,
        accessKeyId: setting.access_key_id.substring(0, 8) + '***',
        isActive: setting.is_active,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新云平台配置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 删除云平台配置
 */
const deletePlatformSetting = async (req, res) => {
  try {
    const { id } = req.params;

    const setting = await PlatformSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '云平台配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 检查是否有域名正在使用该配置
    const domainCount = await Domain.count({
      where: { platform_id: id }
    });

    if (domainCount > 0) {
      return res.status(400).json({
        code: 1001,
        message: '该配置正在被域名使用，无法删除',
        data: null,
        timestamp: Date.now()
      });
    }

    await setting.destroy();

    res.json({
      code: 0,
      message: '云平台配置删除成功',
      data: null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除云平台配置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 启用/禁用云平台配置
 */
const updatePlatformSettingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    if (isActive === undefined) {
      return res.status(400).json({
        code: 1001,
        message: '请提供 isActive 参数',
        data: null,
        timestamp: Date.now()
      });
    }

    const setting = await PlatformSetting.findByPk(id);
    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '云平台配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    setting.is_active = isActive;
    await setting.save();

    res.json({
      code: 0,
      message: '云平台配置状态更新成功',
      data: {
        id: setting.id,
        name: setting.name,
        platform: setting.platform,
        isActive: setting.is_active,
        updatedAt: setting.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新云平台配置状态错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 通过云平台配置获取域名列表
 */
const getDomainsByPlatformSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, pageSize = 10, keyword = '' } = req.query;

    console.log('获取域名列表 - 平台配置ID:', id, '平台:', id, 'page:', page, 'pageSize:', pageSize);

    // 验证平台配置是否存在
    const platformSetting = await PlatformSetting.findByPk(id);
    if (!platformSetting) {
      return res.status(404).json({
        code: 1005,
        message: '云平台配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const { platform, access_key_id, access_key_secret } = platformSetting;
    console.log('平台类型:', platform, 'accessKeyId前8位:', access_key_id?.substring(0, 8));

    let formattedList = [];
    let total = 0;

    // 根据平台类型调用对应的DNS服务
    switch (platform) {
      case 'aliyun': {
        const aliyunDnsService = require('../utils/aliyunDnsService');
        const aliyunResult = await aliyunDnsService.describeDomains(
          access_key_id,
          access_key_secret,
          parseInt(page),
          parseInt(pageSize)
        );
        console.log('阿里云返回结果:', JSON.stringify(aliyunResult, null, 2));
        const domains = aliyunResult.domains?.domain || [];
        total = aliyunResult.totalCount || 0;
        formattedList = domains.map(domain => ({
          domainId: domain.domainId,
          domain: domain.domainName,
          domainName: domain.domainName,
          status: domain.Status || ''
        }));
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        const tencentResult = await tencentDnsService.describeDomains(
          access_key_id,
          access_key_secret,
          (parseInt(page) - 1) * parseInt(pageSize),
          parseInt(pageSize)
        );
        console.log('腾讯云返回结果:', JSON.stringify(tencentResult, null, 2));
        const domains = tencentResult.DomainList || [];
        total = tencentResult.DomainCountInfo?.DomainTotal || 0;
        formattedList = domains.map(domain => ({
          domainId: domain.DomainId,
          domain: domain.Name,
          domainName: domain.Name,
          status: domain.Status
        }));
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        const cloudflareResult = await cloudflareDnsService.listZones(
          access_key_id,
          parseInt(page),
          parseInt(pageSize)
        );
        console.log('Cloudflare返回结果:', JSON.stringify(cloudflareResult, null, 2));
        const domains = cloudflareResult.result || [];
        total = cloudflareResult.result_info?.total_count || 0;
        formattedList = domains.map(zone => ({
          domainId: zone.id,
          domain: zone.name,
          domainName: zone.name,
          status: zone.status
        }));
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    console.log('格式化后的域名列表:', formattedList.length, '条, 总数:', total);

    // 关键词搜索过滤（仅对已获取的结果过滤）
    if (keyword) {
      formattedList = formattedList.filter(item =>
        item.domain.toLowerCase().includes(keyword.toLowerCase())
      );
      total = formattedList.length;
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: formattedList,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取平台配置域名列表错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 获取域名列表（本地数据库）
 */
const getDomainList = async (req, res) => {
  try {
    const { page = 1, pageSize = 20, platformId, keyword, isActive } = req.query;

    console.log('=== getDomainList 被调用 ===');
    console.log('page:', page, 'pageSize:', pageSize, 'platformId:', platformId, 'keyword:', keyword, 'isActive:', isActive);

    // 构建查询条件
    const where = {};
    if (platformId) {
      where.platform_id = platformId;
    }
    if (keyword) {
      where.domain = {
        [Op.like]: `%${keyword}%`
      };
    }
    if (isActive !== undefined && isActive !== '') {
      where.is_active = isActive === 'true' || isActive === true;
    }

    // 查询总数
    const total = await Domain.count({
      where,
      include: [{
        model: PlatformSetting
      }]
    });

    // 查询域名列表
    const domains = await Domain.findAll({
      where,
      include: [{
        model: PlatformSetting,
        attributes: ['id', 'name', 'platform', 'is_active']
      }],
      order: [['created_at', 'DESC']],
      offset: (parseInt(page) - 1) * parseInt(pageSize),
      limit: parseInt(pageSize)
    });

    const list = domains.map(d => ({
      id: d.id,
      domain: d.domain,
      platformId: d.platform_id,
      platformName: d.PlatformSetting?.name,
      platform: d.PlatformSetting?.platform,
      price: d.price,
      requireIcp: d.require_icp,
      isActive: d.is_active,
      isPublic: d.is_public,
      remarks: d.remarks,
      createdAt: d.created_at,
      updatedAt: d.updated_at
    }));

    res.json({
      code: 0,
      message: 'success',
      data: {
        list,
        total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取域名列表错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 添加域名
 */
const addDomain = async (req, res) => {
  try {
    const { domain, platformId, price = 0.00, requireIcp = false, remarks, isPublic = true } = req.body;

    // 参数验证
    if (!domain || !platformId) {
      return res.status(400).json({
        code: 1001,
        message: '域名和云平台配置ID不能为空',
        data: null,
        timestamp: Date.now()
      });
    }

    // 域名格式验证
    const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!domainRegex.test(domain)) {
      return res.status(400).json({
        code: 1001,
        message: '域名格式不正确',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证平台配置是否存在
    const platformSetting = await PlatformSetting.findByPk(platformId);
    if (!platformSetting) {
      return res.status(404).json({
        code: 1005,
        message: '云平台配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 检查域名是否已存在
    const existingDomain = await Domain.findOne({
      where: { domain: domain }
    });
    if (existingDomain) {
      return res.status(400).json({
        code: 1004,
        message: '该域名已存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证域名是否在云平台中
    const { platform, access_key_id, access_key_secret } = platformSetting;
    let domainExistsInCloud = false;

    switch (platform) {
      case 'aliyun': {
        const aliyunDnsService = require('../utils/aliyunDnsService');
        const aliyunResult = await aliyunDnsService.describeDomains(
          access_key_id,
          access_key_secret,
          1,
          100
        );
        const domains = aliyunResult.domains?.domain || [];
        domainExistsInCloud = domains.some(d => d.domainName === domain);
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        const tencentResult = await tencentDnsService.describeDomains(
          access_key_id,
          access_key_secret,
          0,
          100
        );
        const domains = tencentResult.DomainList || [];
        domainExistsInCloud = domains.some(d => d.Name === domain);
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        const cloudflareResult = await cloudflareDnsService.listZones(
          access_key_id,
          1,
          100
        );
        const domains = cloudflareResult.result || [];
        domainExistsInCloud = domains.some(d => d.name === domain);
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    if (!domainExistsInCloud) {
      return res.status(400).json({
        code: 1001,
        message: '该域名在云平台配置中不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 创建域名记录
    const newDomain = await Domain.create({
      domain: domain,
      platform_id: platformId,
      price: price,
      require_icp: requireIcp,
      is_active: true,
      is_public: isPublic,
      remarks: remarks || ''
    });

    res.json({
      code: 0,
      message: '域名添加成功',
      data: {
        id: newDomain.id,
        domain: newDomain.domain,
        platformId: newDomain.platform_id,
        price: newDomain.price,
        requireIcp: newDomain.require_icp,
        isActive: newDomain.is_active,
        isPublic: newDomain.is_public,
        remarks: newDomain.remarks,
        createdAt: newDomain.created_at,
        updatedAt: newDomain.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('添加域名错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 删除域名
 */
const deleteDomain = async (req, res) => {
  try {
    const { domainId } = req.params;

    console.log('=== deleteDomain 被调用 ===');
    console.log('domainId:', domainId);

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId }
    });

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    console.log('删除域名:', domainRecord.domain);

    // 删除域名记录
    await Domain.destroy({
      where: { id: domainId }
    });

    res.json({
      code: 0,
      message: '删除成功',
      data: null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除域名错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 修改域名配置
 */
const updateDomain = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { platformId, price, requireIcp, remarks, isPublic, isActive } = req.body;

    console.log('=== updateDomain 被调用 ===');
    console.log('domainId:', domainId, 'platformId:', platformId, 'price:', price, 'requireIcp:', requireIcp, 'remarks:', remarks, 'isPublic:', isPublic, 'isActive:', isActive);

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId }
    });

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 构建更新对象
    const updateData = {};
    if (platformId !== undefined && platformId !== null && platformId !== '') {
      updateData.platform_id = platformId;
    }
    if (price !== undefined) {
      updateData.price = price;
    }
    if (requireIcp !== undefined) {
      updateData.require_icp = requireIcp;
    }
    if (remarks !== undefined) {
      updateData.remarks = remarks;
    }
    if (isPublic !== undefined) {
      updateData.is_public = isPublic;
    }
    if (isActive !== undefined) {
      updateData.is_active = isActive;
    }

    // 如果要修改 platform_id，需要验证平台是否存在
    if (updateData.platform_id) {
      const platformSetting = await PlatformSetting.findOne({
        where: { id: updateData.platform_id }
      });

      if (!platformSetting) {
        return res.status(400).json({
          code: 1002,
          message: '云平台配置不存在',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    // 更新域名
    await Domain.update(updateData, {
      where: { id: domainId }
    });

    // 获取更新后的域名信息
    const updatedDomain = await Domain.findOne({
      where: { id: domainId },
      include: [{
        model: PlatformSetting,
        attributes: ['id', 'name', 'platform', 'is_active']
      }]
    });

    res.json({
      code: 0,
      message: '修改成功',
      data: {
        id: updatedDomain.id,
        domain: updatedDomain.domain,
        platformId: updatedDomain.platform_id,
        platformName: updatedDomain.PlatformSetting?.name,
        platform: updatedDomain.PlatformSetting?.platform,
        price: updatedDomain.price,
        requireIcp: updatedDomain.require_icp,
        isActive: updatedDomain.is_active,
        isPublic: updatedDomain.is_public,
        remarks: updatedDomain.remarks,
        createdAt: updatedDomain.created_at,
        updatedAt: updatedDomain.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('修改域名配置错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 获取域名解析记录列表
 */
const getDomainRecords = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { page = 1, pageSize = 20, type, keyword } = req.query;

    console.log('=== getDomainRecords 被调用 ===');
    console.log('domainId:', domainId, 'page:', page, 'pageSize:', pageSize, 'type:', type, 'keyword:', keyword);

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId },
      include: [{
        model: PlatformSetting
      }]
    });

    console.log('查询到的 domainRecord:', domainRecord?.id, domainRecord?.domain);
    console.log('关联的 PlatformSetting:', domainRecord?.PlatformSetting?.id, domainRecord?.PlatformSetting?.platform);

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const platformSetting = domainRecord.PlatformSetting;

    if (!platformSetting) {
      return res.status(400).json({
        code: 1001,
        message: '该域名未关联云平台配置',
        data: null,
        timestamp: Date.now()
      });
    }

    const { platform } = platformSetting;
    const domainName = domainRecord.domain;
    console.log('平台类型:', platform, '域名:', domainName);

    let records = [];
    let total = 0;

    // 根据平台类型调用对应的DNS服务
    console.log('准备调用 DNS 服务，平台类型:', platform);
    switch (platform) {
      case 'aliyun': {
        console.log('调用阿里云 describeDomainRecords');
        const aliyunDnsService = require('../utils/aliyunDnsService');
        const aliyunResult = await aliyunDnsService.describeDomainRecords(
          domainName,
          parseInt(page),
          parseInt(pageSize)
        );
        console.log('阿里云返回:', JSON.stringify(aliyunResult, null, 2));
        records = aliyunResult.domainRecords?.record || [];

        // 根据记录类型筛选
        if (type) {
          records = records.filter(r => r.type === type);
        }

        // 根据关键词搜索
        if (keyword) {
          records = records.filter(r =>
            r.rR.toLowerCase().includes(keyword.toLowerCase())
          );
        }

        total = aliyunResult.totalCount || aliyunResult.total || records.length;
        records = records.map(r => ({
          recordId: r.recordId,
          rr: r.RR,
          type: r.type,
          value: r.value,
          ttl: r.tTL,
          line: r.line,
          weight: r.weight,
          status: r.status,
          updatedAt: r.updateTimestamp
        }));
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        const tencentResult = await tencentDnsService.describeDomainRecords(
          domainName,
          (parseInt(page) - 1) * parseInt(pageSize),
          parseInt(pageSize)
        );
        console.log('tencentResult:', JSON.stringify(tencentResult, null, 2));

        // 腾讯云可能直接返回数据，也可能包装在 Response 中
        const responseData = tencentResult.Response || tencentResult;
        records = responseData.RecordList || [];

        // 根据记录类型筛选
        if (type) {
          records = records.filter(r => r.Type === type);
        }

        // 根据关键词搜索
        if (keyword) {
          records = records.filter(r =>
            r.Name.toLowerCase().includes(keyword.toLowerCase())
          );
        }

        total = responseData.TotalCount || records.length;
        records = records.map(r => ({
          recordId: r.RecordId,
          rr: r.Name,
          type: r.Type,
          value: r.Value,
          ttl: r.TTL,
          line: r.Line,
          weight: r.Weight,
          status: r.Status,
          updatedAt: r.UpdatedOn
        }));
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        const cloudflareResult = await cloudflareDnsService.describeDomainRecords(
          domainName,
          parseInt(page),
          parseInt(pageSize)
        );
        records = cloudflareResult.result || [];

        // 根据记录类型筛选
        if (type) {
          records = records.filter(r => r.type === type);
        }

        // 根据关键词搜索
        if (keyword) {
          records = records.filter(r =>
            r.name.toLowerCase().includes(keyword.toLowerCase())
          );
        }

        total = cloudflareResult.result_info?.total_count || records.length;
        records = records.map(r => ({
          recordId: r.id,
          rr: r.name === domainName ? '@' : r.name.replace(`.${domainName}`, ''),
          type: r.type,
          value: r.content,
          ttl: r.ttl,
          line: '-',
          weight: r.priority || 1,
          status: r.proxied ? 'PROXIED' : 'DNS_ONLY',
          updatedAt: r.modified_on
        }));
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: records,
        total: total,
        page: parseInt(page),
        pageSize: parseInt(pageSize)
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取域名解析记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 删除域名解析记录
 */
const deleteDomainRecord = async (req, res) => {
  try {
    const { domainId, recordId } = req.params;

    console.log('=== deleteDomainRecord 被调用 ===');
    console.log('domainId:', domainId, 'recordId:', recordId);

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId },
      include: [{
        model: PlatformSetting
      }]
    });

    console.log('查询到的 domainRecord:', domainRecord?.id, domainRecord?.domain);
    console.log('关联的 PlatformSetting:', domainRecord?.PlatformSetting?.id, domainRecord?.PlatformSetting?.platform);

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const platformSetting = domainRecord.PlatformSetting;

    if (!platformSetting) {
      return res.status(400).json({
        code: 1002,
        message: '域名未关联云平台配置',
        data: null,
        timestamp: Date.now()
      });
    }

    const platform = platformSetting.platform;
    const domainName = domainRecord.domain;

    console.log('平台类型:', platform, '域名:', domainName);

    // 根据平台类型调用相应的删除方法
    switch (platform) {
      case 'aliyun': {
        const aliyunDnsService = require('../utils/aliyunDnsService');
        await aliyunDnsService.deleteDomainRecord(domainName, recordId);
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        await tencentDnsService.deleteDomainRecord(domainName, recordId);
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        await cloudflareDnsService.deleteDomainRecord(domainName, recordId);
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    res.json({
      code: 0,
      message: '删除成功',
      data: null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('删除域名解析记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 新增域名解析记录
 */
const addDomainRecord = async (req, res) => {
  try {
    const { domainId } = req.params;
    const { rr, type, value, ttl = 600, line = '默认' } = req.body;

    console.log('=== addDomainRecord 被调用 ===');
    console.log('domainId:', domainId, 'rr:', rr, 'type:', type, 'value:', value, 'ttl:', ttl, 'line:', line);

    // 参数验证
    if (!rr || !type || !value) {
      return res.status(400).json({
        code: 1003,
        message: '缺少必要参数：rr, type, value',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId },
      include: [{
        model: PlatformSetting
      }]
    });

    console.log('查询到的 domainRecord:', domainRecord?.id, domainRecord?.domain);
    console.log('关联的 PlatformSetting:', domainRecord?.PlatformSetting?.id, domainRecord?.PlatformSetting?.platform);

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const platformSetting = domainRecord.PlatformSetting;

    if (!platformSetting) {
      return res.status(400).json({
        code: 1002,
        message: '域名未关联云平台配置',
        data: null,
        timestamp: Date.now()
      });
    }

    const platform = platformSetting.platform;
    const domainName = domainRecord.domain;

    console.log('平台类型:', platform, '域名:', domainName);

    // 根据平台类型调用相应的添加方法
    let result;
    switch (platform) {
      case 'aliyun': {
        const aliyunDnsService = require('../utils/aliyunDnsService');
        result = await aliyunDnsService.addDomainRecord(domainName, rr, type, value);
        console.log('阿里云返回:', JSON.stringify(result, null, 2));
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        result = await tencentDnsService.addDomainRecord(domainName, rr, type, value);
        console.log('腾讯云返回:', JSON.stringify(result, null, 2));
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        result = await cloudflareDnsService.addDomainRecord(domainName, rr, type, value);
        console.log('Cloudflare返回:', JSON.stringify(result, null, 2));
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    res.json({
      code: 0,
      message: '添加成功',
      data: {
        message: '解析记录已添加',
        result: result
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('新增域名解析记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 修改域名解析记录
 */
const modifyDomainRecord = async (req, res) => {
  try {
    const { domainId, recordId } = req.params;
    const { rr, type, value } = req.body;

    console.log('=== modifyDomainRecord 被调用 ===');
    console.log('domainId:', domainId, 'recordId:', recordId, 'rr:', rr, 'type:', type, 'value:', value);

    // 参数验证
    if (!rr || !type || !value) {
      return res.status(400).json({
        code: 1003,
        message: '缺少必要参数：rr, type, value',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证域名是否存在
    const domainRecord = await Domain.findOne({
      where: { id: domainId },
      include: [{
        model: PlatformSetting
      }]
    });

    console.log('查询到的 domainRecord:', domainRecord?.id, domainRecord?.domain);
    console.log('关联的 PlatformSetting:', domainRecord?.PlatformSetting?.id, domainRecord?.PlatformSetting?.platform);

    if (!domainRecord) {
      return res.status(404).json({
        code: 1005,
        message: '域名不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const platformSetting = domainRecord.PlatformSetting;

    if (!platformSetting) {
      return res.status(400).json({
        code: 1002,
        message: '域名未关联云平台配置',
        data: null,
        timestamp: Date.now()
      });
    }

    const platform = platformSetting.platform;
    const domainName = domainRecord.domain;

    console.log('平台类型:', platform, '域名:', domainName);

    // 根据平台类型调用相应的修改方法
    let result;
    switch (platform) {
      case 'aliyun': {
        const aliyunDnsService = require('../utils/aliyunDnsService');
        result = await aliyunDnsService.modifyDomainRecord(domainName, recordId, rr, type, value);
        console.log('阿里云返回:', JSON.stringify(result, null, 2));
        break;
      }

      case 'tencent': {
        const tencentDnsService = require('../utils/tencentDnsService');
        result = await tencentDnsService.modifyDomainRecord(domainName, recordId, rr, type, value);
        console.log('腾讯云返回:', JSON.stringify(result, null, 2));
        break;
      }

      case 'cloudflare': {
        const cloudflareDnsService = require('../utils/cloudflareDnsService');
        result = await cloudflareDnsService.modifyDomainRecord(domainName, recordId, rr, type, value);
        console.log('Cloudflare返回:', JSON.stringify(result, null, 2));
        break;
      }

      default:
        return res.status(400).json({
          code: 1001,
          message: '不支持的平台类型',
          data: null,
          timestamp: Date.now()
        });
    }

    res.json({
      code: 0,
      message: '修改成功',
      data: {
        message: '解析记录已修改',
        result: result
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('修改域名解析记录错误:', error);
    console.error('错误堆栈:', error.stack);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 添加支付配置
 */
const addPaymentSetting = async (req, res) => {
  try {
    const { paymentMethod, paymentName, configData, isEnabled, sortOrder, description } = req.body;

    // 参数验证
    if (!paymentMethod) {
      return res.status(400).json({
        code: 1001,
        message: '支付方式不能为空',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!paymentName) {
      return res.status(400).json({
        code: 1001,
        message: '支付方式名称不能为空',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!configData || typeof configData !== 'object') {
      return res.status(400).json({
        code: 1001,
        message: '配置数据不能为空且必须是有效的JSON对象',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证支付方式是否合法
    const validMethods = ['alipay', 'wechat', 'epay'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        code: 1001,
        message: '支付方式必须是 alipay、wechat 或 epay 之一',
        data: null,
        timestamp: Date.now()
      });
    }

    // 检查支付方式是否已存在
    const existingSetting = await PaymentSetting.findOne({
      where: { payment_method: paymentMethod }
    });

    if (existingSetting) {
      return res.status(400).json({
        code: 1001,
        message: `支付方式 ${paymentMethod} 的配置已存在，请勿重复添加`,
        data: null,
        timestamp: Date.now()
      });
    }

    // 创建支付配置
    const setting = await PaymentSetting.create({
      payment_method: paymentMethod,
      payment_name: paymentName,
      config_data: configData,
      is_enabled: isEnabled !== undefined ? isEnabled : false,
      sort_order: sortOrder !== undefined ? sortOrder : 0,
      description: description || null
    });

    // 处理敏感字段脱敏
    const maskedConfigData = maskSensitiveData(configData);

    res.json({
      code: 0,
      message: '支付配置添加成功',
      data: {
        id: setting.id,
        paymentMethod: setting.payment_method,
        paymentName: setting.payment_name,
        configData: maskedConfigData,
        isEnabled: setting.is_enabled,
        sortOrder: setting.sort_order,
        description: setting.description,
        createdAt: setting.created_at,
        updatedAt: setting.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('添加支付配置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 敏感数据脱敏处理
 */
const maskSensitiveData = (configData) => {
  if (!configData || typeof configData !== 'object') {
    return configData;
  }

  const sensitiveFields = ['privateKey', 'alipayPublicKey', 'key', 'appSecret', 'mchKey', 'apiKey'];
  const maskedData = { ...configData };

  for (const field of sensitiveFields) {
    if (maskedData[field]) {
      maskedData[field] = '***hidden***';
    }
  }

  return maskedData;
};

/**
 * 获取所有支付配置
 */
const getPaymentSettings = async (req, res) => {
  try {
    const { isEnabled, sortBy = 'sortOrder', sortOrder = 'asc' } = req.query;

    // 构建查询条件
    const whereCondition = {};
    if (isEnabled !== undefined) {
      whereCondition.is_enabled = isEnabled === 'true';
    }

    // 验证排序字段
    const allowedSortFields = ['sortOrder', 'createdAt', 'updatedAt', 'paymentMethod'];
    const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'sortOrder';
    const sortDirection = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // 映射排序字段
    const sortFieldMap = {
      'sortOrder': 'sort_order',
      'createdAt': 'created_at',
      'updatedAt': 'updated_at',
      'paymentMethod': 'payment_method'
    };
    const dbSortField = sortFieldMap[sortField] || 'sort_order';

    const settings = await PaymentSetting.findAll({
      where: whereCondition,
      order: [[dbSortField, sortDirection]]
    });

    // 处理响应数据，脱敏敏感信息
    const list = settings.map(setting => {
      const settingData = setting.toJSON();
      return {
        id: settingData.id,
        paymentMethod: settingData.payment_method,
        paymentName: settingData.payment_name,
        configData: maskSensitiveData(settingData.config_data),
        isEnabled: settingData.is_enabled,
        sortOrder: settingData.sort_order,
        description: settingData.description,
        createdAt: settingData.created_at,
        updatedAt: settingData.updated_at
      };
    });

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        total: list.length,
        list: list
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取支付配置列表错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 获取单个支付配置详情
 */
const getPaymentSettingDetail = async (req, res) => {
  try {
    const { paymentMethod } = req.params;

    // 验证支付方式是否合法
    const validMethods = ['alipay', 'wechat', 'epay'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        code: 1001,
        message: '不支持的支付方式',
        data: null,
        timestamp: Date.now()
      });
    }

    const setting = await PaymentSetting.findOne({
      where: { payment_method: paymentMethod }
    });

    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '支付配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const settingData = setting.toJSON();

    res.json({
      code: 0,
      message: '获取成功',
      data: {
        id: settingData.id,
        paymentMethod: settingData.payment_method,
        paymentName: settingData.payment_name,
        configData: settingData.config_data,
        isEnabled: settingData.is_enabled,
        sortOrder: settingData.sort_order,
        description: settingData.description,
        createdAt: settingData.created_at,
        updatedAt: settingData.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取支付配置详情错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 更新支付配置
 */
const updatePaymentSetting = async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const { configData, isEnabled, sortOrder, description } = req.body;

    // 验证支付方式是否合法
    const validMethods = ['alipay', 'wechat', 'epay'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        code: 1001,
        message: '不支持的支付方式',
        data: null,
        timestamp: Date.now()
      });
    }

    // 查找支付配置
    const setting = await PaymentSetting.findOne({
      where: { payment_method: paymentMethod }
    });

    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '支付配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证是否至少提供一个字段
    if (configData === undefined && isEnabled === undefined && sortOrder === undefined && description === undefined) {
      return res.status(400).json({
        code: 1001,
        message: '请提供至少一个需要修改的字段',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证 configData
    if (configData !== undefined) {
      if (!configData || typeof configData !== 'object') {
        return res.status(400).json({
          code: 1001,
          message: '配置数据必须是有效的JSON对象',
          data: null,
          timestamp: Date.now()
        });
      }
      setting.config_data = configData;
    }

    // 更新其他字段
    if (isEnabled !== undefined) {
      setting.is_enabled = isEnabled;
    }
    if (sortOrder !== undefined) {
      setting.sort_order = sortOrder;
    }
    if (description !== undefined) {
      setting.description = description;
    }

    await setting.save();

    const settingData = setting.toJSON();

    res.json({
      code: 0,
      message: '更新成功',
      data: {
        id: settingData.id,
        paymentMethod: settingData.payment_method,
        paymentName: settingData.payment_name,
        configData: maskSensitiveData(settingData.config_data),
        isEnabled: settingData.is_enabled,
        sortOrder: settingData.sort_order,
        description: settingData.description,
        createdAt: settingData.created_at,
        updatedAt: settingData.updated_at
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('更新支付配置错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 启用/禁用支付方式
 */
const togglePaymentSetting = async (req, res) => {
  try {
    const { paymentMethod } = req.params;
    const { isEnabled } = req.body;

    // 验证支付方式是否合法
    const validMethods = ['alipay', 'wechat', 'epay'];
    if (!validMethods.includes(paymentMethod)) {
      return res.status(400).json({
        code: 1001,
        message: '不支持的支付方式',
        data: null,
        timestamp: Date.now()
      });
    }

    // 验证 isEnabled 参数
    if (isEnabled === undefined || typeof isEnabled !== 'boolean') {
      return res.status(400).json({
        code: 1001,
        message: 'isEnabled 参数必须是布尔值',
        data: null,
        timestamp: Date.now()
      });
    }

    // 查找支付配置
    const setting = await PaymentSetting.findOne({
      where: { payment_method: paymentMethod }
    });

    if (!setting) {
      return res.status(404).json({
        code: 1005,
        message: '支付配置不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    // 更新启用状态
    setting.is_enabled = isEnabled;
    await setting.save();

    res.json({
      code: 0,
      message: isEnabled ? '支付方式已启用' : '支付方式已禁用',
      data: {
        paymentMethod: setting.payment_method,
        isEnabled: setting.is_enabled
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('切换支付方式状态错误:', error);
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
  updateUser,
  getPlatformSettings,
  addPlatformSetting,
  updatePlatformSetting,
  deletePlatformSetting,
  updatePlatformSettingStatus,
  getDomainsByPlatformSetting,
  getDomainList,
  addDomain,
  updateDomain,
  deleteDomain,
  getDomainRecords,
  deleteDomainRecord,
  addDomainRecord,
  modifyDomainRecord,
  addPaymentSetting,
  getPaymentSettings,
  getPaymentSettingDetail,
  updatePaymentSetting,
  togglePaymentSetting
};