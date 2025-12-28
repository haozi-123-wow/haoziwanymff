-- 为settings表添加createdAt和updatedAt字段
-- 检查字段是否已存在，如果不存在则添加
SET @dbname = DATABASE();
SET @tablename = 'settings';
SET @colname1 = 'created_at';
SET @colname2 = 'updated_at';

-- 添加created_at字段
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = @tablename 
        AND column_name = @colname1
        AND table_schema = @dbname
    ) > 0,
    "SELECT 1",
    "ALTER TABLE `settings` ADD COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 添加updated_at字段
SET @preparedStatement = (SELECT IF(
    (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE table_name = @tablename 
        AND column_name = @colname2
        AND table_schema = @dbname
    ) > 0,
    "SELECT 1",
    "ALTER TABLE `settings` ADD COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;"
));

PREPARE stmt FROM @preparedStatement;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 更新现有记录的时间戳
UPDATE `settings` SET `created_at` = NOW(), `updated_at` = NOW() WHERE `created_at` IS NULL;

-- 修改表结构以确保时间戳自动更新
ALTER TABLE `settings` 
MODIFY COLUMN `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
MODIFY COLUMN `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;