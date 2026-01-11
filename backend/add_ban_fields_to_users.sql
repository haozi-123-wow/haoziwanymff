-- 为用户表添加封禁状态和封禁原因字段
-- 执行日期: 2026-01-10

USE haoziwanymff;

-- 添加 is_banned 字段（是否封禁）
ALTER TABLE users
ADD COLUMN is_banned TINYINT(1) DEFAULT 0 COMMENT '是否封禁 (0:未封禁, 1:已封禁)'
AFTER is_active;

-- 添加 ban_reason 字段（封禁原因）
ALTER TABLE users
ADD COLUMN ban_reason TEXT NULL COMMENT '封禁原因'
AFTER is_banned;

-- 为新字段添加索引
ALTER TABLE users
ADD INDEX idx_is_banned (is_banned);

-- 查看更新后的表结构
DESCRIBE users;