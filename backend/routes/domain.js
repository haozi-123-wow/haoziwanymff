const express = require('express');
const { getPublicDomains, checkHostname } = require('../controllers/domainController');

const router = express.Router();

// 获取公开可购买的域名列表
router.get('/public', getPublicDomains);

// 检查主机名是否可用
router.get('/:domainId/check-hostname', checkHostname);

module.exports = router;
