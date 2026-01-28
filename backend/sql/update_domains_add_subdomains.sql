-- ================================================
-- 域名表更新和二级域名表创建脚本
-- 更新日期: 2026-01-25
-- 描述:
--   1. 更新domains表，添加价格、备案等字段
--   2. 创建user_domains表（用户购买使用的域名表）
--   3. 创建subdomains表（用户添加的二级域名表）
-- ================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 第一部分：更新domains表（管理员添加的域名）
-- ================================================

-- 1. 添加域名价格字段（如果不存在）
ALTER TABLE domains
ADD COLUMN IF NOT EXISTS price DECIMAL(10,2) DEFAULT 0.00 COMMENT '域名使用价格' AFTER domain;

-- 2. 添加是否需要备案字段（如果不存在）
ALTER TABLE domains
ADD COLUMN IF NOT EXISTS require_icp BOOLEAN DEFAULT FALSE COMMENT '是否需要备案' AFTER price;

-- 3. 修改remarks字段为TEXT类型（如果存在且不是TEXT类型）
ALTER TABLE domains
MODIFY COLUMN remarks TEXT NULL COMMENT '备注';

-- 4. 确保必要的索引存在
CREATE INDEX IF NOT EXISTS idx_platform_id ON domains(platform_id);
CREATE INDEX IF NOT EXISTS idx_is_active ON domains(is_active);
CREATE INDEX IF NOT EXISTS idx_is_public ON domains(is_public);

-- ================================================
-- 第二部分：创建user_domains表（用户购买使用的域名表）
-- ================================================

CREATE TABLE IF NOT EXISTS user_domains (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  domain_id BIGINT UNSIGNED NOT NULL COMMENT '域名ID（关联domains表）',
  domain_name VARCHAR(255) NOT NULL COMMENT '域名',
  subdomain VARCHAR(100) NOT NULL COMMENT '二级域名',
  full_domain VARCHAR(255) NOT NULL COMMENT '完整域名（二级域名+主域名，如: test.example.com）',
  target_url TEXT NOT NULL COMMENT '目标URL',
  price DECIMAL(10,2) DEFAULT 0.00 COMMENT '购买价格',
  duration_days INT NOT NULL COMMENT '有效期天数',
  icp_verified BOOLEAN DEFAULT FALSE COMMENT '是否已实名认证',
  is_paid BOOLEAN DEFAULT FALSE COMMENT '是否已付费',
  paid_at DATETIME NULL COMMENT '支付时间',
  expires_at DATETIME NOT NULL COMMENT '到期时间',
  status ENUM('active', 'inactive', 'banned', 'pending_payment', 'pending_icp') DEFAULT 'active' COMMENT '状态',
  remarks TEXT NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE INDEX idx_full_domain (full_domain),
  INDEX idx_user_id (user_id),
  INDEX idx_domain_id (domain_id),
  INDEX idx_domain_name (domain_name),
  INDEX idx_subdomain (subdomain),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_is_paid (is_paid),
  CONSTRAINT fk_user_domains_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_user_domains_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户购买域名表';

-- ================================================
-- 第三部分：创建subdomains表（用户添加的二级域名表）
-- ================================================

CREATE TABLE IF NOT EXISTS subdomains (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  domain_id BIGINT UNSIGNED NOT NULL COMMENT '对应的域名ID（关联domains表）',
  user_domain_id BIGINT UNSIGNED NOT NULL COMMENT '用户购买域名ID（关联user_domains表）',
  subdomain VARCHAR(100) NOT NULL COMMENT '二级域名',
  full_domain VARCHAR(255) NOT NULL COMMENT '完整域名（二级域名+主域名，如: test.example.com）',
  record_type ENUM('A', 'AAAA', 'CNAME', 'MX', 'TXT', 'NS', 'SRV') DEFAULT 'A' COMMENT '解析类型',
  record_value VARCHAR(500) NOT NULL COMMENT '解析记录',
  description TEXT NULL COMMENT '用途说明（这个解析记录是干什么的）',
  status ENUM('active', 'inactive', 'pending', 'banned', 'expired') DEFAULT 'active' COMMENT '状态',
  expires_at DATETIME NULL COMMENT '到期时间',
  remarks VARCHAR(500) NULL COMMENT '备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  UNIQUE INDEX idx_full_domain (full_domain),
  INDEX idx_user_id (user_id),
  INDEX idx_domain_id (domain_id),
  INDEX idx_user_domain_id (user_domain_id),
  INDEX idx_subdomain (subdomain),
  INDEX idx_status (status),
  INDEX idx_expires_at (expires_at),
  INDEX idx_created_at (created_at),
  CONSTRAINT fk_subdomains_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT fk_subdomains_domain FOREIGN KEY (domain_id) REFERENCES domains(id) ON DELETE CASCADE,
  CONSTRAINT fk_subdomains_user_domain FOREIGN KEY (user_domain_id) REFERENCES user_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户二级域名表';

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 注意事项
-- ================================================
-- 1. 执行此脚本前请确保已经备份了数据库
-- 2. 如果domains表中已经有user_id等购买下单相关字段，需要先创建新的user_domains表并迁移数据
-- 3. 执行完成后请验证表结构和索引是否正确创建
-- ================================================
