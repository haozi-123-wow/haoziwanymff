-- ========================================================
-- 数据库更新脚本 V3.0
-- 域名购买与解析系统 - 新增表结构
-- 数据库: haoziwanymff
-- MySQL版本: 5.7.44
-- 创建日期: 2024-01-31
-- ========================================================

-- 设置字符集
SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ========================================================
-- 1. domain_packages 表 - 域名套餐表
-- 说明: 管理员配置的域名解析套餐
-- 注意: 使用 bigint(20) 与 domains.id 保持一致（无unsigned）
-- ========================================================
DROP TABLE IF EXISTS `domain_packages`;
CREATE TABLE `domain_packages` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '套餐ID',
  `domain_id` bigint(20) NOT NULL COMMENT '关联域名ID',
  `name` varchar(100) NOT NULL COMMENT '套餐名称',
  `description` text COMMENT '套餐描述',
  `parse_count` int(11) NOT NULL COMMENT '解析次数（可添加多少条解析记录）',
  `duration_days` int(11) NOT NULL COMMENT '有效时长（天）',
  `price` decimal(10,2) NOT NULL COMMENT '套餐价格',
  `original_price` decimal(10,2) DEFAULT NULL COMMENT '原价（用于折扣展示）',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序顺序',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_domain_id` (`domain_id`),
  KEY `idx_is_active` (`is_active`),
  CONSTRAINT `fk_domain_packages_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='域名套餐表';

-- ========================================================
-- 2. user_packages 表 - 用户套餐表
-- 说明: 记录用户购买的套餐及使用情况
-- 注意: user_id 使用 bigint(20) unsigned 与 users.id 保持一致
--       domain_id 和 package_id 使用 bigint(20) 与对应表保持一致
-- ========================================================
DROP TABLE IF EXISTS `user_packages`;
CREATE TABLE `user_packages` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户套餐ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `package_id` bigint(20) NOT NULL COMMENT '套餐ID',
  `domain_id` bigint(20) NOT NULL COMMENT '域名ID',
  `order_id` bigint(20) unsigned NOT NULL COMMENT '关联订单ID',
  `total_count` int(11) NOT NULL COMMENT '总解析次数',
  `used_count` int(11) DEFAULT '0' COMMENT '已使用次数',
  `valid_start` datetime NOT NULL COMMENT '有效期开始',
  `valid_end` datetime NOT NULL COMMENT '有效期结束',
  `status` enum('active','expired') DEFAULT 'active' COMMENT '状态',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_package_id` (`package_id`),
  KEY `idx_domain_id` (`domain_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_status` (`status`),
  KEY `idx_valid_end` (`valid_end`),
  CONSTRAINT `fk_user_packages_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_packages_package_id` FOREIGN KEY (`package_id`) REFERENCES `domain_packages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_user_packages_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户套餐表';

-- ========================================================
-- 3. domain_records 表 - 解析记录表
-- 说明: 存储用户的DNS解析记录
-- ========================================================
DROP TABLE IF EXISTS `domain_records`;
CREATE TABLE `domain_records` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '记录ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `domain_id` bigint(20) NOT NULL COMMENT '域名ID',
  `order_id` bigint(20) unsigned DEFAULT NULL COMMENT '关联订单ID（单次购买时）',
  `website_name` varchar(100) NOT NULL COMMENT '网站名称',
  `hostname` varchar(100) NOT NULL COMMENT '主机名',
  `full_hostname` varchar(255) NOT NULL COMMENT '完整主机名（如：www.example.com）',
  `record_type` enum('A','CNAME','AAAA') NOT NULL COMMENT '解析类型',
  `record_value` varchar(500) NOT NULL COMMENT '解析记录值',
  `ttl` int(11) DEFAULT '600' COMMENT 'TTL值',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `status` enum('pending','paid','reviewing','active','rejected','cancelled','expired') DEFAULT 'pending' COMMENT '状态',
  `cloud_record_id` varchar(100) DEFAULT NULL COMMENT '云平台解析记录ID',
  `reviewed_by` bigint(20) unsigned DEFAULT NULL COMMENT '审核人ID',
  `reviewed_at` datetime DEFAULT NULL COMMENT '审核时间',
  `review_remark` varchar(255) DEFAULT NULL COMMENT '审核备注',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_domain_id` (`domain_id`),
  KEY `idx_order_id` (`order_id`),
  KEY `idx_hostname` (`hostname`),
  KEY `idx_full_hostname` (`full_hostname`),
  KEY `idx_status` (`status`),
  KEY `idx_record_type` (`record_type`),
  CONSTRAINT `fk_domain_records_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_domain_records_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='解析记录表';

-- ========================================================
-- 4. parse_orders 表 - 解析订单表
-- 说明: 记录用户购买解析记录的订单
-- ========================================================
DROP TABLE IF EXISTS `parse_orders`;
CREATE TABLE `parse_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `domain_id` bigint(20) NOT NULL COMMENT '域名ID',
  `website_name` varchar(100) NOT NULL COMMENT '网站名称',
  `hostname` varchar(100) NOT NULL COMMENT '主机名',
  `full_hostname` varchar(255) NOT NULL COMMENT '完整主机名',
  `record_type` enum('A','CNAME','AAAA') NOT NULL COMMENT '解析类型',
  `record_value` varchar(500) NOT NULL COMMENT '解析记录值',
  `ttl` int(11) DEFAULT '600' COMMENT 'TTL值',
  `price` decimal(10,2) NOT NULL COMMENT '订单价格',
  `deduct_package` tinyint(1) DEFAULT '0' COMMENT '是否使用套餐抵扣',
  `deducted_package_id` bigint(20) DEFAULT NULL COMMENT '抵扣的套餐ID',
  `status` enum('pending','paid','reviewing','active','rejected','cancelled','expired') DEFAULT 'pending' COMMENT '订单状态',
  `payment_method` varchar(50) DEFAULT NULL COMMENT '支付方式',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '第三方交易号',
  `remark` varchar(255) DEFAULT NULL COMMENT '备注',
  `expires_at` datetime DEFAULT NULL COMMENT '订单过期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_domain_id` (`domain_id`),
  KEY `idx_status` (`status`),
  KEY `idx_order_no` (`order_no`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_parse_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_parse_orders_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='解析订单表';

-- ========================================================
-- 5. package_orders 表 - 套餐订单表
-- 说明: 记录用户购买套餐的订单
-- ========================================================
DROP TABLE IF EXISTS `package_orders`;
CREATE TABLE `package_orders` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '订单ID',
  `order_no` varchar(50) NOT NULL COMMENT '订单号',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `domain_id` bigint(20) NOT NULL COMMENT '域名ID',
  `package_id` bigint(20) NOT NULL COMMENT '套餐ID',
  `package_name` varchar(100) NOT NULL COMMENT '套餐名称（快照）',
  `parse_count` int(11) NOT NULL COMMENT '解析次数',
  `duration_days` int(11) NOT NULL COMMENT '有效天数',
  `price` decimal(10,2) NOT NULL COMMENT '订单价格',
  `status` enum('pending','paid','completed','cancelled','expired','refunded') DEFAULT 'pending' COMMENT '订单状态',
  `payment_method` varchar(50) DEFAULT NULL COMMENT '支付方式',
  `payment_time` datetime DEFAULT NULL COMMENT '支付时间',
  `transaction_id` varchar(100) DEFAULT NULL COMMENT '第三方交易号',
  `valid_start` datetime DEFAULT NULL COMMENT '有效期开始',
  `valid_end` datetime DEFAULT NULL COMMENT '有效期结束',
  `expires_at` datetime DEFAULT NULL COMMENT '订单过期时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `order_no` (`order_no`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_domain_id` (`domain_id`),
  KEY `idx_package_id` (`package_id`),
  KEY `idx_status` (`status`),
  KEY `idx_created_at` (`created_at`),
  CONSTRAINT `fk_package_orders_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_package_orders_domain_id` FOREIGN KEY (`domain_id`) REFERENCES `domains` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_package_orders_package_id` FOREIGN KEY (`package_id`) REFERENCES `domain_packages` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='套餐订单表';

-- ========================================================
-- 恢复外键检查
-- ========================================================
SET FOREIGN_KEY_CHECKS = 1;

-- ========================================================
-- 完成提示
-- ========================================================
SELECT '数据库更新完成 V3.0 - 域名购买与解析系统表结构' AS 'Message';
