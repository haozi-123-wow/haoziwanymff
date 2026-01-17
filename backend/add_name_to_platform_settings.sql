-- 添加 platform_settings 表的 name 字段
-- 创建日期: 2024-01-17

SET NAMES utf8mb4;

-- 添加 name 字段
ALTER TABLE platform_settings
ADD COLUMN `name` VARCHAR(100) NOT NULL COMMENT '配置名称 (如: 个人阿里云、公司阿里云)' AFTER `id`;

-- 更新现有数据（如果没有 name，则生成一个默认名称）
UPDATE platform_settings
SET `name` = CASE
    WHEN platform = 'aliyun' THEN '阿里云配置'
    WHEN platform = 'tencent' THEN '腾讯云配置'
    WHEN platform = 'cloudflare' THEN 'Cloudflare配置'
    ELSE platform
END
WHERE `name` IS NULL OR `name` = '';
