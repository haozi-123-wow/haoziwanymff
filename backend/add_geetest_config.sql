-- 添加极验配置到数据库
INSERT INTO settings (`key`, `value`, `description`, `type`, `created_at`, `updated_at`)
VALUES 
  (
    'geetestConfig', 
    '{"captchaId": "d7c668635786e7f4fdaaf8b7b972f2af", "captchaKey": "42a2a1538cb96cbe3e62d0866f46c980", "apiServer": "http://gcaptcha4.geetest.com"}', 
    '极验验证配置', 
    'geetest', 
    NOW(), 
    NOW()
  )
ON DUPLICATE KEY UPDATE
  value = VALUES(value),
  description = VALUES(description),
  type = VALUES(type),
  updated_at = VALUES(updated_at);