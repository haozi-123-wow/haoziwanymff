const { User, Setting } = require('../models');
const { sendActivationEmail, sendVerificationCodeEmail } = require('../utils/emailService');
const { verifyValidateToken } = require('../utils/geetestService');
const {
  generateVerificationCode,
  canSendCode,
  storeRecord,
  verifyEmailCode,
  RESEND_INTERVAL_SECONDS
} = require('../utils/emailCodeService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

const allowedEmailScenes = new Set(['register', 'reset_password', 'update_email', 'login']);
const normalizeEmail = (email = '') => email.trim().toLowerCase();

const defaultRegisterConfig = {
  allowRegister: true,
  needActivation: true,
  needCaptcha: true
};

const ensureBoolean = (value, defaultValue) => {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') {
      return true;
    }
    if (value.toLowerCase() === 'false') {
      return false;
    }
  }
  return defaultValue;
};

const normalizeRegisterConfig = (config = {}) => ({
  allowRegister: ensureBoolean(config.allowRegister, defaultRegisterConfig.allowRegister),
  needActivation: ensureBoolean(config.needActivation, defaultRegisterConfig.needActivation),
  needCaptcha: ensureBoolean(config.needCaptcha, defaultRegisterConfig.needCaptcha)
});

const getRegisterConfig = async () => {
  try {
    const setting = await Setting.findOne({ where: { key: 'registerConfig' } });
    if (!setting || !setting.value) {
      return { ...defaultRegisterConfig };
    }
    let parsed = setting.value;
    if (typeof parsed === 'string') {
      parsed = JSON.parse(parsed);
    }
    return normalizeRegisterConfig(parsed || {});
  } catch (error) {
    console.warn('加载注册配置失败:', error.message);
    return { ...defaultRegisterConfig };
  }
};

const usernamePattern = /^[a-zA-Z0-9_]{3,20}$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;
const MAX_PASSWORD_LENGTH = 32;
const sanitizeString = (value = '') => (typeof value === 'string' ? value.trim() : '');
const DEFAULT_LOGIN_EXPIRES_IN_SECONDS = 2 * 60 * 60;
const durationUnitMap = {
  s: 1,
  m: 60,
  h: 60 * 60,
  d: 60 * 60 * 24
};
const parseExpireInSeconds = (value, fallback = DEFAULT_LOGIN_EXPIRES_IN_SECONDS) => {
  if (value === undefined || value === null) {
    return fallback;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const normalized = String(value).trim();
  if (!normalized) {
    return fallback;
  }
  if (/^\d+$/.test(normalized)) {
    return parseInt(normalized, 10);
  }
  const durationMatch = normalized.match(/^(\d+)\s*([smhd])$/i);
  if (!durationMatch) {
    return fallback;
  }
  const amount = parseInt(durationMatch[1], 10);
  const unit = durationMatch[2].toLowerCase();
  const multiplier = durationUnitMap[unit];
  return amount && multiplier ? amount * multiplier : fallback;
};

const roleButtonMap = {
  admin: ['system:dashboard', 'system:user:list', 'system:user:update', 'system:settings:update'],
  user: ['system:dashboard'],
  guest: []
};
const buildPermissionMeta = (role = 'user') => ({
  roles: role ? [role] : [],
  buttons: roleButtonMap[role] || []
});

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const { username = '', email = '', password = '', validate_token } = req.body || {};
    const sanitizedUsername = typeof username === 'string' ? username.trim() : '';
    const sanitizedEmail = normalizeEmail(email);
    const sanitizedPassword = typeof password === 'string' ? password.trim() : '';
    const registerConfig = await getRegisterConfig();

    if (!registerConfig.allowRegister) {
      return res.status(403).json({
        code: 1002,
        message: '当前暂不开放注册',
        data: null,
        timestamp: Date.now()
      });
    }

    const missingFields = [];
    if (!sanitizedUsername) missingFields.push('username');
    if (!sanitizedEmail) missingFields.push('email');
    if (!sanitizedPassword) missingFields.push('password');
    if (registerConfig.needCaptcha && !validate_token) missingFields.push('validate_token');

    if (missingFields.length) {
      return res.status(400).json({
        code: 1001,
        message: `缺少必要参数: ${missingFields.join(', ')}`,
        data: null,
        timestamp: Date.now()
      });
    }

    if (!usernamePattern.test(sanitizedUsername)) {
      return res.status(400).json({
        code: 1001,
        message: '用户名需为3-20位字母、数字或下划线',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!emailPattern.test(sanitizedEmail)) {
      return res.status(400).json({
        code: 1001,
        message: '请输入合法的邮箱地址',
        data: null,
        timestamp: Date.now()
      });
    }

    if (
      sanitizedPassword.length < MIN_PASSWORD_LENGTH ||
      sanitizedPassword.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        code: 1001,
        message: `密码长度需在${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}位之间`,
        data: null,
        timestamp: Date.now()
      });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [
          { email: sanitizedEmail },
          { username: sanitizedUsername }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        code: 1004,
        message:
          existingUser.email === sanitizedEmail
            ? '该邮箱已被注册'
            : '该用户名已被使用',
        data: null,
        timestamp: Date.now()
      });
    }

    if (registerConfig.needCaptcha) {
      const isValidCaptcha = await verifyValidateToken(validate_token);
      if (!isValidCaptcha) {
        return res.status(400).json({
          code: 1002,
          message: '人机验证未通过，请重新验证',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    let activationToken = null;
    let activationTokenExpires = null;

    if (registerConfig.needActivation) {
      activationToken = crypto.randomBytes(32).toString('hex');
      const expiresHours = parseInt(process.env.ACTIVATION_LINK_EXPIRES_HOURS || '24', 10);
      activationTokenExpires = new Date(Date.now() + expiresHours * 60 * 60 * 1000);
    }

    const user = await User.create({
      username: sanitizedUsername,
      email: sanitizedEmail,
      password: sanitizedPassword,
      isActive: registerConfig.needActivation ? false : true,
      activationToken,
      activationTokenExpires
    });

    if (registerConfig.needActivation) {
      try {
        await sendActivationEmail(user, activationToken);
      } catch (emailError) {
        await User.destroy({ where: { id: user.id } });
        return res.status(500).json({
          code: 5000,
          message: `用户创建成功，但激活邮件发送失败: ${emailError.message}`,
          data: null,
          timestamp: Date.now()
        });
      }
    }

    const successMessage = registerConfig.needActivation
      ? '注册成功，请检查您的邮箱以激活账户'
      : '注册成功，您已可以直接登录';

    res.status(201).json({
      code: 0,
      message: successMessage,
      data: {
        userId: user.id,
        username: user.username,
        email: user.email,
        createdAt: user.createdAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 用户激活账户
 */
const activateAccount = async (req, res) => {
  try {
    const paramToken = typeof req.params.token === 'string' ? req.params.token.trim() : '';
    const queryToken = typeof req.query.token === 'string' ? req.query.token.trim() : '';
    const bodyToken = req.body && typeof req.body.token === 'string' ? req.body.token.trim() : '';
    const token = paramToken || queryToken || bodyToken;

    if (!token) {
      return res.status(400).json({
        code: 1001,
        message: '缺少激活令牌，请确认链接是否完整',
        data: null,
        timestamp: Date.now()
      });
    }

    const user = await User.findOne({
      where: {
        activationToken: token
      }
    });

    if (!user) {
      return res.status(400).json({
        code: 1003,
        message: '激活链接无效或已过期',
        data: null,
        timestamp: Date.now()
      });
    }

    const now = Date.now();
    const expiresAt = user.activationTokenExpires ? new Date(user.activationTokenExpires).getTime() : 0;

    if (!expiresAt || expiresAt <= now) {
      user.activationToken = null;
      user.activationTokenExpires = null;
      await user.save();
      return res.status(400).json({
        code: 1003,
        message: '激活链接无效或已过期',
        data: null,
        timestamp: Date.now()
      });
    }

    if (user.isActive) {
      user.activationToken = null;
      user.activationTokenExpires = null;
      await user.save();
      return res.status(200).json({
        code: 0,
        message: '账户已激活，可直接登录',
        data: {
          userId: user.id,
          username: user.username,
          email: user.email
        },
        timestamp: Date.now()
      });
    }

    // 激活用户
    user.isActive = true;
    user.activationToken = null;
    user.activationTokenExpires = null;
    await user.save();

    res.status(200).json({
      code: 0,
      message: '账户激活成功',
      data: {
        userId: user.id,
        username: user.username,
        email: user.email
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('激活错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 用户登录
 */
const login = async (req, res) => {
  try {
    const { account = '', password = '', validate_token = '' } = req.body || {};
    const sanitizedAccount = sanitizeString(account);
    const sanitizedPassword = sanitizeString(password);
    const sanitizedValidateToken = sanitizeString(validate_token);

    const missingFields = [];
    if (!sanitizedAccount) missingFields.push('account');
    if (!sanitizedPassword) missingFields.push('password');
    if (!sanitizedValidateToken) missingFields.push('validate_token');

    if (missingFields.length) {
      return res.status(400).json({
        code: 1001,
        message: `缺少必要参数: ${missingFields.join(', ')}`,
        data: null,
        timestamp: Date.now()
      });
    }

    const isEmailAccount = sanitizedAccount.includes('@');
    if (isEmailAccount && !emailPattern.test(sanitizedAccount)) {
      return res.status(400).json({
        code: 1001,
        message: '请输入合法的邮箱地址',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!isEmailAccount && !usernamePattern.test(sanitizedAccount)) {
      return res.status(400).json({
        code: 1001,
        message: '用户名需为3-20位字母、数字或下划线',
        data: null,
        timestamp: Date.now()
      });
    }

    if (
      sanitizedPassword.length < MIN_PASSWORD_LENGTH ||
      sanitizedPassword.length > MAX_PASSWORD_LENGTH
    ) {
      return res.status(400).json({
        code: 1001,
        message: `密码长度需在${MIN_PASSWORD_LENGTH}-${MAX_PASSWORD_LENGTH}位之间`,
        data: null,
        timestamp: Date.now()
      });
    }

    const isValidCaptcha = await verifyValidateToken(sanitizedValidateToken);
    if (!isValidCaptcha) {
      return res.status(400).json({
        code: 1002,
        message: '人机验证未通过，请重新验证',
        data: null,
        timestamp: Date.now()
      });
    }

    const user = await User.findOne({
      where: {
        [Op.or]: [
          { username: sanitizedAccount },
          { email: normalizeEmail(sanitizedAccount) }
        ]
      }
    });

    if (!user || !(await user.comparePassword(sanitizedPassword))) {
      return res.status(401).json({
        code: 1002,
        message: '账号或密码错误',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        code: 1003,
        message: '账户未激活，请检查邮箱并激活账户',
        data: null,
        timestamp: Date.now()
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('服务器未配置 JWT_SECRET');
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiresIn });
    const expireInSeconds = parseExpireInSeconds(jwtExpiresIn);

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        expireIn: expireInSeconds,
        userInfo: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 邮箱验证码登录
 */
const loginWithEmailCode = async (req, res) => {
  try {
    const { email, code, validate_token } = req.body || {};
    const sanitizedEmail = normalizeEmail(email);
    const sanitizedCode = typeof code === 'string' ? code.trim() : '';
    const sanitizedValidateToken = sanitizeString(validate_token);

    const missingFields = [];
    if (!sanitizedEmail) missingFields.push('email');
    if (!sanitizedCode) missingFields.push('code');
    if (!sanitizedValidateToken) missingFields.push('validate_token');

    if (missingFields.length) {
      return res.status(400).json({
        code: 1001,
        message: `缺少必要参数: ${missingFields.join(', ')}`,
        data: null,
        timestamp: Date.now()
      });
    }

    if (!emailPattern.test(sanitizedEmail)) {
      return res.status(400).json({
        code: 1001,
        message: '请输入合法的邮箱地址',
        data: null,
        timestamp: Date.now()
      });
    }

    const isValidCaptcha = await verifyValidateToken(sanitizedValidateToken);
    if (!isValidCaptcha) {
      return res.status(400).json({
        code: 1002,
        message: '人机验证未通过，请重新验证',
        data: null,
        timestamp: Date.now()
      });
    }

    const user = await User.findOne({
      where: {
        email: sanitizedEmail
      }
    });

    if (!user) {
      return res.status(401).json({
        code: 1002,
        message: '邮箱未注册',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        code: 1003,
        message: '账户未激活，请检查邮箱并激活账户',
        data: null,
        timestamp: Date.now()
      });
    }

    const verification = await verifyEmailCode(sanitizedEmail, 'login', sanitizedCode);
    if (!verification.valid) {
      return res.status(400).json({
        code: 1002,
        message: verification.reason,
        data: null,
        timestamp: Date.now()
      });
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('服务器未配置 JWT_SECRET');
    }

    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const tokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role
    };

    const token = jwt.sign(tokenPayload, jwtSecret, { expiresIn: jwtExpiresIn });
    const expireInSeconds = parseExpireInSeconds(jwtExpiresIn);

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        expireIn: expireInSeconds,
        userInfo: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('邮箱验证码登录错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 发送邮箱验证码
 */
const sendEmailCode = async (req, res) => {
  try {
    const { email, scene, validate_token } = req.body;

    if (!email || !scene || !validate_token) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数',
        data: null,
        timestamp: Date.now()
      });
    }

    const normalizedScene = scene.toLowerCase();
    if (!allowedEmailScenes.has(normalizedScene)) {
      return res.status(400).json({
        code: 1001,
        message: '不支持的验证码场景',
        data: null,
        timestamp: Date.now()
      });
    }

    const normalizedEmail = normalizeEmail(email);

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

    let actingUser = null;
    if (normalizedScene === 'update_email') {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        return res.status(401).json({
          code: 1002,
          message: '修改邮箱需登录后操作',
          data: null,
          timestamp: Date.now()
        });
      }

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        actingUser = await User.findByPk(decoded.userId);

        if (!actingUser) {
          return res.status(401).json({
            code: 1005,
            message: '用户不存在或已被删除',
            data: null,
            timestamp: Date.now()
          });
        }
      } catch (authError) {
        return res.status(403).json({
          code: 1003,
          message: '令牌无效或已过期',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    if (normalizedScene === 'register') {
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (existing) {
        return res.status(400).json({
          code: 1004,
          message: '该邮箱已被注册',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    if (normalizedScene === 'reset_password') {
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (!existing) {
        return res.status(404).json({
          code: 1005,
          message: '该邮箱尚未注册',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    if (normalizedScene === 'login') {
      const existing = await User.findOne({ where: { email: normalizedEmail } });
      if (!existing) {
        return res.status(404).json({
          code: 1005,
          message: '该邮箱尚未注册',
          data: null,
          timestamp: Date.now()
        });
      }
      if (!existing.isActive) {
        return res.status(401).json({
          code: 1003,
          message: '账户未激活，请检查邮箱并激活账户',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    if (normalizedScene === 'update_email') {
      if (!actingUser) {
        return res.status(401).json({
          code: 1002,
          message: '修改邮箱需登录后操作',
          data: null,
          timestamp: Date.now()
        });
      }

      if (normalizeEmail(actingUser.email) === normalizedEmail) {
        return res.status(400).json({
          code: 1001,
          message: '新邮箱不能与当前邮箱相同',
          data: null,
          timestamp: Date.now()
        });
      }

      const occupied = await User.findOne({ where: { email: normalizedEmail } });
      if (occupied) {
        return res.status(400).json({
          code: 1004,
          message: '该邮箱已被使用',
          data: null,
          timestamp: Date.now()
        });
      }
    }

    // 频率限制
    const { allowed, retryAfter } = await canSendCode(normalizedEmail, normalizedScene);
    if (!allowed) {
      return res.status(429).json({
        code: 1001,
        message: '验证码请求过于频繁，请稍后再试',
        data: { retryAfter },
        timestamp: Date.now()
      });
    }

    const verificationCode = generateVerificationCode();
    await storeRecord(normalizedEmail, normalizedScene, verificationCode);
    await sendVerificationCodeEmail({ to: normalizedEmail, code: verificationCode, scene: normalizedScene });

    res.json({
      code: 0,
      message: '验证码发送成功',
      data: {
        retryAfter: RESEND_INTERVAL_SECONDS
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('发送邮箱验证码错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '验证码发送失败',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 找回密码
 */
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword, validate_token } = req.body;

    if (!email || !code || !newPassword || !validate_token) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数',
        data: null,
        timestamp: Date.now()
      });
    }

    const sanitizedEmail = normalizeEmail(email);

    const isValidCaptcha = await verifyValidateToken(validate_token);
    if (!isValidCaptcha) {
      return res.status(400).json({
        code: 1002,
        message: '人机验证未通过，请重新验证',
        data: null,
        timestamp: Date.now()
      });
    }

    const user = await User.findOne({ where: { email: sanitizedEmail } });
    if (!user) {
      return res.status(404).json({
        code: 1005,
        message: '用户不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    const verification = await verifyEmailCode(sanitizedEmail, 'reset_password', code);
    if (!verification.valid) {
      return res.status(400).json({
        code: 1002,
        message: verification.reason,
        data: null,
        timestamp: Date.now()
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      code: 0,
      message: '密码重置成功',
      data: null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('找回密码错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 用户登出
 */
const logout = (req, res) => {
  res.json({
    code: 0,
    message: '退出登录成功',
    data: null,
    timestamp: Date.now()
  });
};

/**
 * 获取当前用户信息
 */
const getMe = async (req, res) => {
  try {
    if (!req.user && !req.userId) {
      return res.status(401).json({
        code: 1002,
        message: '请登录后再访问该接口',
        data: null,
        timestamp: Date.now()
      });
    }

    let userInstance = req.user;
    if (!userInstance && req.userId) {
      userInstance = await User.findByPk(req.userId, {
        attributes: { exclude: ['password', 'activationToken', 'activationTokenExpires'] }
      });
    }

    if (!userInstance) {
      return res.status(404).json({
        code: 1005,
        message: '用户不存在或已被删除',
        data: null,
        timestamp: Date.now()
      });
    }

    const plainUser = typeof userInstance.toJSON === 'function' ? userInstance.toJSON() : userInstance;
    const { password, activationToken, activationTokenExpires, ...safeUser } = plainUser;

    const role = safeUser.role || 'user';
    const permissionMeta = buildPermissionMeta(role);
    const userId = safeUser.id != null ? String(safeUser.id) : '';

    res.json({
      code: 0,
      message: 'success',
      data: {
        id: safeUser.id,
        userId,
        username: safeUser.username,
        userName: safeUser.username,
        email: safeUser.email,
        role,
        roles: permissionMeta.roles,
        buttons: permissionMeta.buttons,
        isActive: Boolean(safeUser.isActive),
        createdAt: safeUser.createdAt,
        updatedAt: safeUser.updatedAt
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

/**
 * 修改绑定邮箱
 */
const updateEmail = async (req, res) => {
  try {
    const { newEmail, code, validate_token } = req.body;

    if (!newEmail || !code || !validate_token) {
      return res.status(400).json({
        code: 1001,
        message: '缺少必要参数',
        data: null,
        timestamp: Date.now()
      });
    }

    const sanitizedEmail = normalizeEmail(newEmail);

    const isValidCaptcha = await verifyValidateToken(validate_token);
    if (!isValidCaptcha) {
      return res.status(400).json({
        code: 1002,
        message: '人机验证未通过，请重新验证',
        data: null,
        timestamp: Date.now()
      });
    }

    if (!req.user) {
      return res.status(401).json({
        code: 1002,
        message: '请登录后再尝试修改邮箱',
        data: null,
        timestamp: Date.now()
      });
    }

    if (normalizeEmail(req.user.email) === sanitizedEmail) {
      return res.status(400).json({
        code: 1001,
        message: '新邮箱不能与当前邮箱相同',
        data: null,
        timestamp: Date.now()
      });
    }

    const occupied = await User.findOne({ where: { email: sanitizedEmail } });
    if (occupied) {
      return res.status(400).json({
        code: 1004,
        message: '该邮箱已被使用',
        data: null,
        timestamp: Date.now()
      });
    }

    const verification = await verifyEmailCode(sanitizedEmail, 'update_email', code);
    if (!verification.valid) {
      return res.status(400).json({
        code: 1002,
        message: verification.reason,
        data: null,
        timestamp: Date.now()
      });
    }

    req.user.email = sanitizedEmail;
    await req.user.save();

    res.json({
      code: 0,
      message: '邮箱变更成功',
      data: null,
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('修改邮箱错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};

module.exports = {
  register,
  activateAccount,
  login,
  loginWithEmailCode,
  sendEmailCode,
  resetPassword,
  logout,
  getMe,
  updateEmail
};
