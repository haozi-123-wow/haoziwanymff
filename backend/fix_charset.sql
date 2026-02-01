-- ============================================
-- 数据库字符集修复脚本
-- 修复所有表和字段的字符集为 utf8mb4 以支持中文存储
-- ============================================

-- 设置数据库字符集
ALTER DATABASE CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 1. packages 表 (套餐表) - 新增表，优先修复
-- ============================================
ALTER TABLE packages CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE packages MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '套餐名称';
ALTER TABLE packages MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '套餐描述';

-- ============================================
-- 2. users 表 (用户表)
-- ============================================
ALTER TABLE users CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE users MODIFY username VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用户名';
ALTER TABLE users MODIFY ban_reason TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '封禁原因';
ALTER TABLE users MODIFY role VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '角色';

-- ============================================
-- 3. domains 表 (域名表)
-- ============================================
ALTER TABLE domains CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE domains MODIFY remarks TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注';

-- ============================================
-- 4. platform_settings 表 (平台配置表)
-- ============================================
ALTER TABLE platform_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE platform_settings MODIFY name VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置名称';

-- ============================================
-- 5. payment_settings 表 (支付配置表)
-- ============================================
ALTER TABLE payment_settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE payment_settings MODIFY payment_name VARCHAR(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '支付方式名称';
ALTER TABLE payment_settings MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '配置描述';

-- ============================================
-- 6. subdomains 表 (二级域名表)
-- ============================================
ALTER TABLE subdomains CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE subdomains MODIFY description TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '用途说明';
ALTER TABLE subdomains MODIFY remarks VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注';

-- ============================================
-- 7. user_domains 表 (用户购买域名表)
-- ============================================
ALTER TABLE user_domains CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE user_domains MODIFY target_url TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '目标URL';
ALTER TABLE user_domains MODIFY remarks TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '备注';

-- ============================================
-- 8. settings 表 (系统设置表)
-- ============================================
ALTER TABLE settings CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE settings MODIFY value TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '设置值';
ALTER TABLE settings MODIFY description VARCHAR(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci COMMENT '描述';

-- ============================================
-- 9. captchas 表 (验证码表)
-- ============================================
ALTER TABLE captchas CONVERT TO CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- ============================================
-- 修复完成
-- ============================================
SELECT '所有表字符集修复完成' AS message;
