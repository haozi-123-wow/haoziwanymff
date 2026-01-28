-- ================================================
-- 数据迁移脚本：将domains表中的购买下单数据迁移到user_domains表
-- 更新日期: 2026-01-25
-- 描述:
--   将domains表中属于用户购买使用的域名数据迁移到user_domains表
-- ================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ================================================
-- 第一步：检查domains表是否有购买下单相关字段
-- ================================================

-- 如果domains表中有user_id字段，说明存在购买下单数据，需要迁移
-- 迁移逻辑：
-- 1. 从domains表中选择所有有user_id的记录
-- 2. 将这些记录插入到user_domains表
-- 3. 从domains表中删除这些记录（或者标记为已迁移）

-- ================================================
-- 第二步：迁移数据到user_domains表
-- ================================================

-- 检查user_id字段是否存在，如果存在则进行迁移
-- 注意：这个脚本假设domains表中有user_id, domain_name, subdomain等字段

-- 迁移数据（如果domains表中有这些字段）
INSERT INTO user_domains (
  user_id,
  domain_id,
  domain_name,
  subdomain,
  full_domain,
  target_url,
  price,
  duration_days,
  icp_verified,
  is_paid,
  paid_at,
  expires_at,
  status,
  remarks,
  created_at,
  updated_at
)
SELECT
  user_id,
  id AS domain_id,
  COALESCE(domain_name, domain) AS domain_name,
  subdomain,
  CONCAT(COALESCE(subdomain, ''), '.', COALESCE(domain_name, domain)) AS full_domain,
  target_url,
  COALESCE(price, 0.00) AS price,
  COALESCE(duration_days, 30) AS duration_days,
  COALESCE(icp_verified, FALSE) AS icp_verified,
  COALESCE(is_paid, FALSE) AS is_paid,
  paid_at,
  expires_at,
  COALESCE(status, 'active') AS status,
  remarks,
  created_at,
  updated_at
FROM domains
WHERE user_id IS NOT NULL
  AND domain_name IS NOT NULL
  AND subdomain IS NOT NULL;

-- ================================================
-- 第三步：清理domains表中的购买下单相关字段
-- ================================================

-- 删除已迁移的数据（可选）
-- DELETE FROM domains WHERE user_id IS NOT NULL;

-- 或者可以选择保留这些数据，但在以后不再使用这些字段

-- ================================================
-- 第四步：从domains表中删除购买下单相关字段（可选）
-- ================================================

-- 警告：执行以下语句前请确保数据已经成功迁移到user_domains表
-- ALTER TABLE domains DROP COLUMN user_id;
-- ALTER TABLE domains DROP COLUMN domain_name;
-- ALTER TABLE domains DROP COLUMN subdomain;
-- ALTER TABLE domains DROP COLUMN target_url;
-- ALTER TABLE domains DROP COLUMN duration_days;
-- ALTER TABLE domains DROP COLUMN icp_verified;
-- ALTER TABLE domains DROP COLUMN is_paid;
-- ALTER TABLE domains DROP COLUMN paid_at;
-- ALTER TABLE domains DROP COLUMN expires_at;
-- ALTER TABLE domains DROP COLUMN status;

SET FOREIGN_KEY_CHECKS = 1;

-- ================================================
-- 验证迁移结果
-- ================================================

-- 检查user_domains表中的记录数
-- SELECT COUNT(*) AS migrated_count FROM user_domains;

-- 检查domains表中是否还有购买下单相关的数据
-- SELECT COUNT(*) AS remaining_count FROM domains WHERE user_id IS NOT NULL;

-- ================================================
-- 注意事项
-- ================================================
-- 1. 执行此脚本前请确保已经备份了数据库
-- 2. 先执行update_domains_add_subdomains.sql创建user_domains表
-- 3. 在执行第四步（删除字段）前，请先验证数据是否已经成功迁移
-- 4. 建议在生产环境执行前先在测试环境验证
-- ================================================
