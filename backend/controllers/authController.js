const { User } = require('../models');
const { sendActivationEmail } = require('../utils/emailService');
const { verifyValidateToken } = require('../utils/geetestService');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

/**
 * 用户注册
 */
const register = async (req, res) => {
  try {
    const { username, email, password, validate_token } = req.body;

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

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { email },
          { username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        code: 1004,
        message: existingUser.email === email 
          ? '该邮箱已被注册' 
          : '该用户名已被使用',
        data: null,
        timestamp: Date.now()
      });
    }

    // 生成激活令牌
    const activationToken = crypto.randomBytes(32).toString('hex');
    const activationTokenExpires = new Date(Date.now() + (parseInt(process.env.ACTIVATION_LINK_EXPIRES_HOURS) * 60 * 60 * 1000)); // 24小时

    // 创建新用户
    const user = await User.create({
      username,
      email,
      password,
      isActive: false, // 新用户默认未激活
      activationToken,
      activationTokenExpires
    });

    // 发送激活邮件
    try {
      await sendActivationEmail(user, activationToken);
    } catch (emailError) {
      // 如果邮件发送失败，删除已创建的用户并返回错误
      await User.destroy({ where: { id: user.id } });
      return res.status(500).json({
        code: 5000,
        message: `用户创建成功，但激活邮件发送失败: ${emailError.message}`,
        data: null,
        timestamp: Date.now()
      });
    }

    res.status(201).json({
      code: 0,
      message: '注册成功，请检查您的邮箱以激活账户',
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
    const { token } = req.params;

    const user = await User.findOne({
      where: {
        activationToken: token,
        activationTokenExpires: { [require('sequelize').Op.gt]: new Date() }
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
    const { account, password, validate_token } = req.body;

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

    // 查找用户（用户名或邮箱）
    const user = await User.findOne({
      where: {
        [require('sequelize').Op.or]: [
          { username: account },
          { email: account }
        ]
      }
    });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        code: 1002,
        message: '账号或密码错误',
        data: null,
        timestamp: Date.now()
      });
    }

    // 检查账户是否已激活
    if (!user.isActive) {
      return res.status(401).json({
        code: 1003,
        message: '账户未激活，请检查邮箱并激活账户',
        data: null,
        timestamp: Date.now()
      });
    }

    // 生成JWT令牌
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      code: 0,
      message: '登录成功',
      data: {
        token,
        expireIn: process.env.JWT_EXPIRES_IN || '7d',
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
    const user = await User.findByPk(req.userId, {
      attributes: { exclude: ['password'] } // 排除密码字段
    });
    
    if (!user) {
      return res.status(404).json({
        code: 1005,
        message: '用户不存在',
        data: null,
        timestamp: Date.now()
      });
    }

    res.json({
      code: 0,
      message: 'success',
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt
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

module.exports = {
  register,
  activateAccount,
  login,
  logout,
  getMe
};