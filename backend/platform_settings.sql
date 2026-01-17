-- --------------------------------------------------------
-- 主机:                           pc.haoziwan.cn
-- 服务器版本:                        5.7.44-log - Source distribution
-- 服务器操作系统:                      Linux
-- HeidiSQL 版本:                  12.14.0.7165
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- 正在导出表  haoziwanymff.platform_settings 的数据：~2 rows (大约)
INSERT INTO `platform_settings` (`id`, `platform`, `access_key_id`, `access_key_secret`, `is_active`, `config`, `created_at`, `updated_at`) VALUES
	(1, 'aliyun', 'YOUR_ALIYUN_ACCESS_KEY_ID', 'YOUR_ALIYUN_ACCESS_KEY_SECRET', 1, NULL, '2026-01-17 14:17:07', '2026-01-17 14:17:09'),
	(2, 'tencent', 'YOUR_TENCENT_SECRET_ID', 'YOUR_TENCENT_SECRET_KEY', 1, NULL, '2026-01-17 17:10:48', '2026-01-17 17:10:49');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
