-- --------------------------------------------------------
-- 主机:                           pc.haoziwan.cn
-- 服务器版本:                        5.7.44 - MySQL Community Server (GPL)
-- 服务器操作系统:                      Linux
-- HeidiSQL 版本:                  12.15.0.7171
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- 导出 haoziwanymff 的数据库结构
CREATE DATABASE IF NOT EXISTS `haoziwanymff` /*!40100 DEFAULT CHARACTER SET latin1 */;
USE `haoziwanymff`;

-- 导出  表 haoziwanymff.admin_audit_logs 结构
CREATE TABLE IF NOT EXISTS `admin_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `admin_session_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员会话ID',
  `action_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `action_description` text COLLATE utf8mb4_unicode_ci COMMENT '操作描述',
  `action_reason` text COLLATE utf8mb4_unicode_ci COMMENT '操作原因',
  `target_id` int(11) DEFAULT NULL COMMENT '目标ID',
  `target_type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '目标类型',
  `target_content` text COLLATE utf8mb4_unicode_ci COMMENT '目标内容',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT '用户代理',
  `request_method` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '请求方法',
  `request_url` text COLLATE utf8mb4_unicode_ci COMMENT '请求URL',
  `request_body` json DEFAULT NULL COMMENT '请求体',
  `response_code` int(11) DEFAULT NULL COMMENT '响应状态码',
  `response_message` text COLLATE utf8mb4_unicode_ci COMMENT '响应消息',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_admin_session_id` (`admin_session_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`),
  KEY `idx_target_id` (`target_id`),
  KEY `idx_ip_address` (`ip_address`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员审计日志表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.admin_session_logs 结构
CREATE TABLE IF NOT EXISTS `admin_session_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `admin_session_id` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '管理员会话ID',
  `action_type` enum('LOGIN','LOGOUT') COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '操作类型',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT '用户代理',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_admin_session_id` (`admin_session_id`),
  KEY `idx_action_type` (`action_type`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='管理员会话日志表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.audit_failures 结构
CREATE TABLE IF NOT EXISTS `audit_failures` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_ip` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户IP地址',
  `failure_count` int(11) DEFAULT '1' COMMENT '失败次数',
  `first_failure_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '首次失败时间',
  `last_failure_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '最后失败时间',
  `is_blocked` tinyint(1) DEFAULT '0' COMMENT '是否被封禁',
  `blocked_at` timestamp NULL DEFAULT NULL COMMENT '封禁时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_ip` (`user_ip`),
  KEY `idx_is_blocked` (`is_blocked`),
  KEY `idx_last_failure_at` (`last_failure_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审核失败记录表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.captchas 结构
CREATE TABLE IF NOT EXISTS `captchas` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '令牌ID，主键，自增',
  `token` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '验证令牌',
  `user_id` bigint(20) unsigned DEFAULT NULL COMMENT '关联用户ID',
  `expires_at` datetime NOT NULL COMMENT '过期时间',
  `used` tinyint(1) DEFAULT '0' COMMENT '是否已使用 (0:未使用, 1:已使用)',
  `type` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT 'geetest' COMMENT '令牌类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `idx_token` (`token`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_expires_at` (`expires_at`),
  KEY `idx_used` (`used`)
) ENGINE=InnoDB AUTO_INCREMENT=86 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='验证令牌表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.domains 结构
CREATE TABLE IF NOT EXISTS `domains` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `domain` varchar(255) NOT NULL COMMENT '域名 (如: example.com)',
  `price` decimal(10,2) DEFAULT '0.00' COMMENT '域名使用价格',
  `require_icp` tinyint(1) DEFAULT '0' COMMENT '是否需要备案',
  `platform_id` bigint(20) NOT NULL COMMENT '关联的平台配置ID',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `is_public` tinyint(1) DEFAULT '1' COMMENT '是否公开(允许用户注册)',
  `remarks` varchar(255) DEFAULT NULL COMMENT '备注',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain` (`domain`),
  UNIQUE KEY `domains_domain` (`domain`),
  KEY `platform_id` (`platform_id`),
  KEY `domains_platform_id` (`platform_id`),
  KEY `domains_is_active` (`is_active`),
  KEY `domains_is_public` (`is_public`),
  CONSTRAINT `domains_ibfk_1` FOREIGN KEY (`platform_id`) REFERENCES `platform_settings` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COMMENT='域名表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.email_logs 结构
CREATE TABLE IF NOT EXISTS `email_logs` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '日志ID，主键，自增',
  `user_id` bigint(20) unsigned DEFAULT NULL COMMENT '关联用户ID',
  `recipient` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '收件人邮箱',
  `subject` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮件主题',
  `content` text COLLATE utf8mb4_unicode_ci COMMENT '邮件内容',
  `status` enum('sent','failed','pending') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '发送状态 (sent:已发送, failed:发送失败, pending:待发送)',
  `error_message` text COLLATE utf8mb4_unicode_ci COMMENT '错误信息',
  `sent_at` timestamp NULL DEFAULT NULL COMMENT '发送时间',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_recipient` (`recipient`),
  KEY `idx_status` (`status`),
  KEY `idx_sent_at` (`sent_at`),
  CONSTRAINT `email_logs_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='邮件日志表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.ip_block_audit_logs 结构
CREATE TABLE IF NOT EXISTS `ip_block_audit_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `admin_session_id` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '管理员会话ID',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT 'IP地址',
  `block_reason` text COLLATE utf8mb4_unicode_ci COMMENT '封禁原因',
  `target_speech_id` int(11) DEFAULT NULL COMMENT '目标话语ID',
  `target_content` text COLLATE utf8mb4_unicode_ci COMMENT '目标内容',
  `edgeone_result` json DEFAULT NULL COMMENT 'EdgeOne封禁结果',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_admin_session_id` (`admin_session_id`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='IP封禁审计日志表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.payment_settings 结构
CREATE TABLE IF NOT EXISTS `payment_settings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `payment_method` varchar(50) NOT NULL COMMENT '支付方式 (alipay/wechat/epay)',
  `payment_name` varchar(100) NOT NULL COMMENT '支付方式名称',
  `config_data` json NOT NULL COMMENT '配置数据 (JSON对象)',
  `is_enabled` tinyint(1) DEFAULT '0' COMMENT '是否启用',
  `sort_order` int(11) DEFAULT '0' COMMENT '排序顺序',
  `description` text COMMENT '配置描述',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `payment_method` (`payment_method`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='支付配置表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.platform_domains 结构
CREATE TABLE IF NOT EXISTS `platform_domains` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '域名ID,主键,自增',
  `platform_id` bigint(20) NOT NULL COMMENT '关联的云平台配置ID',
  `domain_name` varchar(255) NOT NULL COMMENT '域名(如: example.com)',
  `price` decimal(10,2) NOT NULL COMMENT '域名使用价格(元)',
  `need_filing` tinyint(1) DEFAULT '1' COMMENT '是否需要备案(0:不需要, 1:需要)',
  `is_public` tinyint(1) DEFAULT '1' COMMENT '是否公开(0:不公开, 1:公开,公开则用户可见可选择)',
  `remarks` text COMMENT '备注',
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用(0:禁用, 1:启用)',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `domain_name` (`domain_name`),
  KEY `idx_platform_id` (`platform_id`),
  KEY `idx_domain_name` (`domain_name`),
  KEY `idx_is_public` (`is_public`),
  KEY `idx_is_active` (`is_active`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COMMENT='平台域名表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.platform_settings 结构
CREATE TABLE IF NOT EXISTS `platform_settings` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `name` varchar(100) NOT NULL COMMENT '配置名称 (如: 个人阿里云、公司阿里云)',
  `platform` varchar(255) NOT NULL COMMENT '平台名称 (如: aliyun, tencent)',
  `access_key_id` varchar(255) NOT NULL,
  `access_key_secret` varchar(255) NOT NULL,
  `is_active` tinyint(1) DEFAULT '1' COMMENT '是否启用',
  `config` json DEFAULT NULL,
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COMMENT='云服务配置';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.security_event_logs 结构
CREATE TABLE IF NOT EXISTS `security_event_logs` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `event_type` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '事件类型',
  `event_level` enum('INFO','WARNING','ERROR','CRITICAL') COLLATE utf8mb4_unicode_ci DEFAULT 'INFO' COMMENT '事件级别',
  `event_description` text COLLATE utf8mb4_unicode_ci COMMENT '事件描述',
  `ip_address` varchar(45) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT 'IP地址',
  `user_agent` text COLLATE utf8mb4_unicode_ci COMMENT '用户代理',
  `request_data` json DEFAULT NULL COMMENT '请求数据',
  `response_data` json DEFAULT NULL COMMENT '响应数据',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  KEY `idx_event_type` (`event_type`),
  KEY `idx_event_level` (`event_level`),
  KEY `idx_ip_address` (`ip_address`),
  KEY `idx_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='安全事件日志表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.settings 结构
CREATE TABLE IF NOT EXISTS `settings` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '设置ID，主键，自增',
  `key` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设置键名',
  `value` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '设置值(JSON格式)',
  `description` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '设置描述',
  `type` enum('general','email','geetest','other') COLLATE utf8mb4_unicode_ci DEFAULT 'general' COMMENT '设置类型',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `key` (`key`),
  KEY `idx_key` (`key`),
  KEY `idx_type` (`type`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统设置表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.user_verifications 结构
CREATE TABLE IF NOT EXISTS `user_verifications` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
  `user_id` bigint(20) unsigned NOT NULL COMMENT '用户ID',
  `real_name` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '真实姓名',
  `id_card` varchar(18) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '身份证号',
  `id_card_front` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '身份证正面照片URL',
  `id_card_back` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '身份证反面照片URL',
  `phone` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '手机号',
  `status` enum('pending','approved','rejected') COLLATE utf8mb4_unicode_ci DEFAULT 'pending' COMMENT '认证状态: pending-待审核, approved-已通过, rejected-已拒绝',
  `verified_at` datetime DEFAULT NULL COMMENT '认证通过时间',
  `reject_reason` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '拒绝原因',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_status` (`status`),
  CONSTRAINT `fk_user_verifications_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户实名认证表';

-- 数据导出被取消选择。

-- 导出  表 haoziwanymff.users 结构
CREATE TABLE IF NOT EXISTS `users` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT COMMENT '用户ID，主键，自增',
  `username` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '用户名',
  `email` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '邮箱',
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '加密密码',
  `is_active` tinyint(1) DEFAULT '0' COMMENT '是否激活 (0:未激活, 1:已激活)',
  `is_banned` tinyint(1) DEFAULT '0' COMMENT '是否封禁 (0:未封禁, 1:已封禁)',
  `ban_reason` text COLLATE utf8mb4_unicode_ci COMMENT '封禁原因',
  `activation_token` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '激活令牌',
  `activation_token_expires` datetime DEFAULT NULL COMMENT '激活令牌过期时间',
  `role` enum('user','admin') COLLATE utf8mb4_unicode_ci DEFAULT 'user' COMMENT '用户角色 (user:普通用户, admin:管理员)',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_email` (`email`),
  KEY `idx_username` (`username`),
  KEY `idx_activation_token` (`activation_token`),
  KEY `idx_is_banned` (`is_banned`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户表';

-- 数据导出被取消选择。

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
