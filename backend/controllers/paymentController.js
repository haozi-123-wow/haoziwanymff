const { PaymentSetting, User } = require('../models');

const getPaymentMethods = async (req, res) => {
  try {
    const userId = req.user.id;

    const paymentSettings = await PaymentSetting.findAll({
      where: { is_enabled: true },
      order: [['sort_order', 'ASC']],
      attributes: ['payment_method', 'payment_name', 'is_enabled', 'config_data']
    });

    const user = await User.findByPk(userId, {
      attributes: ['id', 'balance']
    });

    const methods = [];

    for (const setting of paymentSettings) {
      if (setting.payment_method === 'epay') {
        const configData = setting.config_data || {};
        const epayMethods = configData.supported_methods || ['alipay', 'wechat', 'qqpay'];
        
        for (const method of epayMethods) {
          const methodNameMap = {
            'alipay': '支付宝',
            'wechat': '微信支付',
            'qqpay': 'QQ支付'
          };
          
          methods.push({
            code: `epay_${method}`,
            name: `${methodNameMap[method] || method}`,
            icon: `https://example.com/icons/${method}.png`,
            enabled: setting.is_enabled,
            parentMethod: 'epay'
          });
        }
      } else if (setting.payment_method === 'balance' && user) {
        methods.push({
          code: setting.payment_method,
          name: setting.payment_name,
          icon: `https://example.com/icons/${setting.payment_method}.png`,
          enabled: setting.is_enabled,
          balance: parseFloat(user.balance || 0)
        });
      } else {
        methods.push({
          code: setting.payment_method,
          name: setting.payment_name,
          icon: `https://example.com/icons/${setting.payment_method}.png`,
          enabled: setting.is_enabled
        });
      }
    }

    res.json({
      code: 0,
      message: 'success',
      data: { methods }
    });
  } catch (error) {
    console.error('获取支付方式失败:', error);
    res.status(500).json({
      code: 5000,
      message: '服务器内部错误'
    });
  }
};

module.exports = {
  getPaymentMethods
};
