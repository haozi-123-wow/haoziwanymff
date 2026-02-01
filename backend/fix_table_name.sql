-- ============================================
-- 修复表名错误
-- 删除错误的 packages 表，使用正确的 domain_packages 表
-- ============================================

-- 删除错误的 packages 表（如果存在）
DROP TABLE IF EXISTS packages;

-- 删除错误的 parse_orders 表（如果存在，这个表名没有在文档中定义）
DROP TABLE IF EXISTS parse_orders;

-- 确保 domain_packages 表存在且字符集正确
CREATE TABLE IF NOT EXISTS domain_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    domain_id BIGINT NOT NULL COMMENT '关联域名ID',
    name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '套餐名称',
    description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '套餐描述',
    parse_count INT NOT NULL COMMENT '解析次数',
    duration_days INT NOT NULL COMMENT '有效天数',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    original_price DECIMAL(10, 2) DEFAULT 0.00 COMMENT '原价',
    is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_domain_id (domain_id),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='域名套餐表';

-- 检查 user_packages 表是否存在，不存在则创建
CREATE TABLE IF NOT EXISTS user_packages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    package_id BIGINT NOT NULL COMMENT '套餐ID',
    domain_id BIGINT NOT NULL COMMENT '域名ID',
    total_count INT NOT NULL COMMENT '总解析次数',
    used_count INT DEFAULT 0 COMMENT '已使用次数',
    valid_start DATETIME COMMENT '有效期开始',
    valid_end DATETIME COMMENT '有效期结束',
    status VARCHAR(50) DEFAULT 'active' COMMENT '状态(active/expired)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_package_id (package_id),
    INDEX idx_domain_id (domain_id),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户套餐表';

-- 检查 domain_records 表是否存在，不存在则创建
CREATE TABLE IF NOT EXISTS domain_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    domain_id BIGINT NOT NULL COMMENT '域名ID',
    website_name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '网站名称',
    hostname VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '主机名',
    record_type VARCHAR(50) DEFAULT 'A' COMMENT '解析类型(A/CNAME/AAAA)',
    record_value VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '解析记录值',
    ttl INT DEFAULT 600 COMMENT 'TTL值',
    remark TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注',
    status VARCHAR(50) DEFAULT 'pending' COMMENT '状态(pending/reviewing/active/rejected)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_user_id (user_id),
    INDEX idx_domain_id (domain_id),
    INDEX idx_hostname (hostname),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='解析记录表';

-- ============================================
-- 修复完成
-- ============================================
SELECT '表名修复完成' AS message;
SHOW TABLES LIKE '%package%';
SHOW TABLES LIKE '%record%';
