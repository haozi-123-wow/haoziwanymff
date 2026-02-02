const crypto = require('crypto');

class AlipayService {
  constructor(config) {
    this.appId = config.app_id;
    this.privateKey = config.private_key;
    this.publicKey = config.public_key;
    this.gatewayUrl = config.gateway_url || 'https://openapi.alipay.com/gateway.do';
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
      .createSign(signString, this.privateKey)
      .update('RSA-SHA256')
      .digest('base64');
  }

  async createPayment(order) {
    const params = {
      app_id: this.appId,
      method: 'alipay.trade.precreate',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString().replace(/T/, ' ').replace(/\.\d+Z/, ''),
      version: '1.0',
      notify_url: process.env.ALIPAY_NOTIFY_URL,
      return_url: process.env.ALIPAY_RETURN_URL,
      biz_content: JSON.stringify({
        out_trade_no: order.order_no,
        total_amount: order.price.toFixed(2),
        subject: `解析订单-${order.order_no}`,
        body: `${order.website_name} - ${order.full_hostname}`,
        timeout_express: '30m',
        product_code: 'FAST_INSTANT_TRADE_PAY'
      })
    };

    const sign = this.generateSign(params);
    params.sign = sign;

    const queryString = Object.keys(params)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
      .join('&');

    const paymentUrl = `${this.gatewayUrl}?${queryString}`;
    const qrCode = `https://qr.alipay.com/${this.generateQrCode(paymentUrl)}`;

    return {
      paymentUrl,
      qrCode,
      amount: order.price,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  verifyNotify(params) {
    const sign = params.sign;
    delete params.sign;
    
    const calculatedSign = this.generateSign(params);
    
    if (sign !== calculatedSign) {
      return false;
    }

    return true;
  }

  generateQrCode(url) {
    return Buffer.from(url).toString('base64');
  }
}

module.exports = AlipayService;
