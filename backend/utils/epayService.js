const crypto = require('crypto');

class EpayService {
  constructor(config) {
    this.pid = config.pid;
    this.key = config.key;
    this.gatewayUrl = config.gateway_url || 'https://pay.example.com/submit.php';
    this.notifyUrl = config.notify_url;
  }

  generateSign(params) {
    const sortedParams = Object.keys(params).sort().reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});
    
    const signString = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('&');
    
    return crypto
      .createHash('md5')
      .update(signString + this.key)
      .digest('hex')
      .toUpperCase();
  }

  async createPayment(order, paymentMethod) {
    const methodMap = {
      'alipay': 'alipay',
      'wechat': 'wxpay',
      'qqpay': 'qqpay'
    };

    const type = methodMap[paymentMethod] || 'alipay';
    const methodNameMap = {
      'alipay': '支付宝',
      'wechat': '微信支付',
      'qqpay': 'QQ支付'
    };

    const params = {
      pid: this.pid,
      type: type,
      out_trade_no: order.order_no,
      notify_url: this.notifyUrl,
      name: `${order.website_name} - ${order.full_hostname}`,
      money: order.price.toFixed(2),
      client_ip: order.client_ip || '127.0.0.1'
    };

    const sign = this.generateSign(params);
    params.sign = sign;
    params.sign_type = 'MD5';

    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const paymentUrl = `${this.gatewayUrl}?${queryString}`;
    const qrCode = `${this.gatewayUrl}?type=${type}&data=${encodeURIComponent(JSON.stringify(params))}`;

    return {
      paymentUrl,
      qrCode,
      amount: order.price,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  verifyNotify(params) {
    const sign = params.sign;
    const signType = params.sign_type;
    delete params.sign;
    delete params.sign_type;
    
    const calculatedSign = this.generateSign(params);
    
    if (sign !== calculatedSign) {
      return false;
    }

    return true;
  }

  generateNotifyResponse(success) {
    return success ? 'success' : 'fail';
  }
}

module.exports = EpayService;
