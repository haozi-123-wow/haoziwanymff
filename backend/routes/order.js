const express = require('express');
const { createParseOrder, payParseOrder } = require('../controllers/orderController');
const { getPaymentMethods } = require('../controllers/paymentController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// 所有订单相关路由都需要认证
router.use(authenticateToken);

// 获取可用支付方式
router.get('/payment/methods', getPaymentMethods);

// 创建解析订单
router.post('/parse-orders', createParseOrder);

// 支付解析订单
router.post('/parse-orders/:orderId/pay', payParseOrder);

module.exports = router;
