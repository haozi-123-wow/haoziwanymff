-- --------------------------------
-- Haoziwanymff 二级域名分发系统数据库初始化脚本
-- --------------------------------

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '用户ID，主键，自增',
  username VARCHAR(50) NOT NULL UNIQUE COMMENT '用户名',
  email VARCHAR(100) NOT NULL UNIQUE COMMENT '邮箱',
  password VARCHAR(255) NOT NULL COMMENT '加密密码',
  is_active TINYINT(1) DEFAULT 0 COMMENT '是否激活 (0:未激活, 1:已激活)',
  activation_token VARCHAR(255) NULL COMMENT '激活令牌',
  activation_token_expires DATETIME NULL COMMENT '激活令牌过期时间',
  role ENUM('user', 'admin') DEFAULT 'user' COMMENT '用户角色 (user:普通用户, admin:管理员)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_email (email),
  INDEX idx_username (username),
  INDEX idx_activation_token (activation_token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 创建设置表
CREATE TABLE IF NOT EXISTS settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '设置ID，主键，自增',
  `key` VARCHAR(100) NOT NULL UNIQUE COMMENT '设置键名',
  value TEXT NOT NULL COMMENT '设置值(JSON格式)',
  description VARCHAR(255) NULL COMMENT '设置描述',
  type ENUM('general', 'email', 'geetest', 'other') DEFAULT 'general' COMMENT '设置类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_key (`key`),
  INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

-- 创建验证令牌表
CREATE TABLE IF NOT EXISTS captchas (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '令牌ID，主键，自增',
  token VARCHAR(255) NOT NULL UNIQUE COMMENT '验证令牌',
  user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
  expires_at DATETIME NOT NULL COMMENT '过期时间',
  used TINYINT(1) DEFAULT 0 COMMENT '是否已使用 (0:未使用, 1:已使用)',
  type VARCHAR(50) DEFAULT 'geetest' COMMENT '令牌类型',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_token (token),
  INDEX idx_user_id (user_id),
  INDEX idx_expires_at (expires_at),
  INDEX idx_used (used)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证令牌表';

-- 创建域名表
CREATE TABLE IF NOT EXISTS domains (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '域名ID，主键，自增',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '所属用户ID',
  domain_name VARCHAR(255) NOT NULL COMMENT '域名',
  subdomain VARCHAR(100) NOT NULL COMMENT '二级域名',
  target_url TEXT NOT NULL COMMENT '目标URL',
  status ENUM('active', 'inactive', 'banned') DEFAULT 'active' COMMENT '状态 (active:启用, inactive:禁用, banned:封禁)',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_domain_name (domain_name),
  INDEX idx_subdomain (subdomain),
  INDEX idx_status (status),
  UNIQUE INDEX idx_domain_subdomain (domain_name, subdomain),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='域名表';

-- 创建邮件日志表
CREATE TABLE IF NOT EXISTS email_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID，主键，自增',
  user_id BIGINT UNSIGNED NULL COMMENT '关联用户ID',
  recipient VARCHAR(255) NOT NULL COMMENT '收件人邮箱',
  subject VARCHAR(255) NOT NULL COMMENT '邮件主题',
  content TEXT NULL COMMENT '邮件内容',
  status ENUM('sent', 'failed', 'pending') DEFAULT 'pending' COMMENT '发送状态 (sent:已发送, failed:发送失败, pending:待发送)',
  error_message TEXT NULL COMMENT '错误信息',
  sent_at TIMESTAMP NULL COMMENT '发送时间',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_recipient (recipient),
  INDEX idx_status (status),
  INDEX idx_sent_at (sent_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件日志表';

-- 插入初始系统设置
INSERT INTO settings (`key`, value, description, type) VALUES
('siteTitle', 'Haoziwanymff 管理系统', '网站标题', 'general'),
('siteDescription', '一个功能强大的二级域名分发系统', '网站描述', 'general'),
('registerConfig', '{"allowRegister": true, "needActivation": true, "needCaptcha": true}', '注册配置', 'general');

-- 恢复外键检查
SET FOREIGN_KEY_CHECKS = 1;

-- --------------------------------
-- 初始化脚本执行完成
-- --------------------------------