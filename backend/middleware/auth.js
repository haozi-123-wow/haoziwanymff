const jwt = require('jsonwebtoken');
const { User } = require('../models');

/**
 * 验证JWT Token
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const rawHeader = typeof authHeader === 'string' ? authHeader.trim() : '';
  let token = '';

  if (rawHeader) {
    if (rawHeader.toLowerCase().startsWith('bearer ')) {
      token = rawHeader.substring(7).trim();
    } else {
      token = rawHeader;
    }
  }

  if (!token) {
    return res.status(401).json({
      code: 1002,
      message: '未提供访问令牌',
      data: null,
      timestamp: Date.now()
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
    if (err) {
      return res.status(403).json({
        code: 1003,
        message: '令牌无效或已过期',
        data: null,
        timestamp: Date.now()
      });
    }

    try {
      const user = await User.findByPk(decoded.userId);
      if (!user) {
        return res.status(401).json({
          code: 1005,
          message: '用户不存在',
          data: null,
          timestamp: Date.now()
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          code: 1003,
          message: '账户未激活',
          data: null,
          timestamp: Date.now()
        });
      }

      req.userId = user.id;
      req.user = user;
      next();
    } catch (error) {
      res.status(500).json({
        code: 5000,
        message: error.message || '服务器内部错误',
        data: null,
        timestamp: Date.now()
      });
    }
  });
};

/**
 * 验证管理员权限
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      code: 1002,
      message: '权限不足，仅管理员可执行此操作',
      data: null,
      timestamp: Date.now()
    });
  }
  next();
};

module.exports = {
  authenticateToken,
  requireAdmin
};