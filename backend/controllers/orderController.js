const { ParseOrder, UserPackage, Domain, User, sequelize, PaymentSetting } = require('../models');
const { Op } = require('sequelize');
const AlipayService = require('../utils/alipayService');
const WechatPayService = require('../utils/wechatPayService');
const EpayService = require('../utils/epayService');

const generateOrderNo = () => {
  const timestamp = Date.now().toString();
  const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  return `PO${timestamp}${random}`;
};

const createParseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { domainId, websiteName, hostname, recordType, recordValue, remark } = req.body;
    const userId = req.user.id;

    if (!domainId || !websiteName || !hostname || !recordType || !recordValue) {
      await transaction.rollback();
      return res.status(400).json({
        code: 1001,
        message: '参数错误：缺少必填参数'
      });
    }

    if (!['A', 'CNAME', 'AAAA'].includes(recordType)) {
      await transaction.rollback();
      return res.status(400).json({
        code: 2006,
        message: '解析类型不支持（仅支持A/CNAME/AAAA）'
      });
    }

    const domain = await Domain.findByPk(domainId, { transaction });
    if (!domain) {
      await transaction.rollback();
      return res.status(404).json({
        code: 1005,
        message: '域名不存在'
      });
    }

    const now = new Date();

    const userPackages = await UserPackage.findAll({
      where: {
        user_id: userId,
        domain_id: domainId,
        status: 'active',
        valid_end: {
          [Op.gt]: now
        }
      },
      order: [['valid_end', 'ASC']],
      transaction
    });

    let price = domain.price;
    let deductPackage = false;
    let deductedPackageId = null;
    let status = 'pending';
    let expiresAt = new Date(now.getTime() + 30 * 60 * 1000);

    if (userPackages.length > 0) {
      const availablePackage = userPackages.find(up => up.total_count - up.used_count > 0);
      
      if (availablePackage) {
        deductPackage = true;
        deductedPackageId = availablePackage.id;
        price = 0.00;
        status = 'reviewing';

        await UserPackage.update(
          { used_count: availablePackage.used_count + 1 },
          { where: { id: availablePackage.id }, transaction }
        );
      }
    }

    const fullHostname = hostname === '@' ? domain.domain_name : `${hostname}.${domain.domain_name}`;

    const order = await ParseOrder.create({
      user_id: userId,
      order_no: generateOrderNo(),
      domain_id: domainId,
      website_name: websiteName,
      hostname,
      full_hostname: fullHostname,
      record_type: recordType,
      record_value: recordValue,
      ttl: 600,
      price,
      deduct_package: deductPackage,
      deducted_package_id: deductedPackageId,
      status,
      remark: remark || null,
      expires_at: deductPackage ? null : expiresAt
    }, { transaction });

    await transaction.commit();

    const responseData = {
      orderId: order.id,
      orderNo: order.order_no,
      domainId: order.domain_id,
      domainName: domain.domain_name,
      websiteName: order.website_name,
      hostname: order.hostname,
      fullHostname: order.full_hostname,
      recordType: order.record_type,
      recordValue: order.record_value,
      ttl: order.ttl,
      price: parseFloat(order.price),
      deductPackage: order.deduct_package,
      status: order.status,
      remark: order.remark,
      createdAt: order.created_at
    };

    if (deductPackage) {
      responseData.deductedPackageId = deductedPackageId;
      return res.json({
        code: 0,
        message: '订单创建成功，使用套餐抵扣',
        data: responseData
      });
    } else {
      responseData.expiresAt = expiresAt;
      return res.json({
        code: 0,
        message: '订单创建成功，请完成支付',
        data: responseData
      });
    }
  } catch (error) {
    await transaction.rollback();
    console.error('创建解析订单失败:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误'
    });
  }
};

const payParseOrder = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { orderId } = req.params;
    const { paymentMethod } = req.body;
    const userId = req.user.id;

    if (!orderId || !paymentMethod) {
      await transaction.rollback();
      return res.status(400).json({
        code: 1001,
        message: '参数错误：缺少orderId或paymentMethod'
      });
    }

    const order = await ParseOrder.findOne({
      where: {
        id: orderId,
        user_id: userId,
        status: 'pending'
      },
      include: [
        {
          model: Domain,
          attributes: ['domain_name']
        }
      ],
      transaction
    });

    if (!order) {
      await transaction.rollback();
      return res.status(404).json({
        code: 1005,
        message: '订单不存在或状态不正确'
      });
    }

    if (order.deduct_package) {
      await transaction.rollback();
      return res.status(400).json({
        code: 2001,
        message: '订单已使用套餐抵扣，无需支付'
      });
    }

    const paymentSetting = await PaymentSetting.findOne({
      where: {
        payment_method: paymentMethod,
        is_enabled: true
      },
      transaction
    });

    if (!paymentSetting) {
      await transaction.rollback();
      return res.status(400).json({
        code: 3003,
        message: '支付配置不存在或未启用'
      });
    }

    const configData = paymentSetting.config_data || {};

    await ParseOrder.update(
      {
        status: 'paying',
        payment_method: paymentMethod
      },
      {
        where: { id: orderId },
        transaction
      }
    );

    let paymentResult;

    if (paymentMethod === 'alipay') {
      const alipayService = new AlipayService(configData);
      paymentResult = await alipayService.createPayment({
        order_no: order.order_no,
        price: parseFloat(order.price),
        website_name: order.website_name,
        full_hostname: order.full_hostname
      });
    } else if (paymentMethod === 'wechat') {
      const wechatService = new WechatPayService(configData);
      paymentResult = await wechatService.createPayment({
        order_no: order.order_no,
        price: parseFloat(order.price),
        website_name: order.website_name,
        full_hostname: order.full_hostname
      });
    } else if (paymentMethod.startsWith('epay_')) {
      const epayMethod = paymentMethod.replace('epay_', '');
      const epayService = new EpayService(configData);
      paymentResult = await epayService.createPayment({
        order_no: order.order_no,
        price: parseFloat(order.price),
        website_name: order.website_name,
        full_hostname: order.full_hostname,
        payment_method: epayMethod,
        client_ip: req.ip || req.connection.remoteAddress
      });
      paymentResult.paymentMethod = 'epay';
    } else if (paymentMethod === 'balance') {
      await transaction.rollback();
      return res.status(400).json({
        code: 3001,
        message: '余额支付暂未开发'
      });
    } else {
      await transaction.rollback();
      return res.status(400).json({
        code: 1001,
        message: '不支持的支付方式'
      });
    }

    await transaction.commit();

    res.json({
      code: 0,
      message: '支付请求创建成功',
      data: {
        orderId: order.id,
        orderNo: order.order_no,
        paymentMethod: paymentResult.paymentMethod || paymentMethod,
        ...paymentResult
      }
    });
  } catch (error) {
    await transaction.rollback();
    console.error('支付解析订单失败:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  createParseOrder,
  payParseOrder
};
