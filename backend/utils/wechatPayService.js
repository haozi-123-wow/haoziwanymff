const crypto = require('crypto');
const xmlbuilder = require('xmlbuilder');

class WechatPayService {
  constructor(config) {
    this.appId = config.app_id;
    this.mchId = config.mch_id;
    this.apiKey = config.api_key;
    this.notifyUrl = config.notify_url;
    this.unifiedOrderUrl = 'https://api.mch.weixin.qq.com/pay/unifiedorder';
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
      .update(signString + '&key=' + this.apiKey)
      .digest('hex')
      .toUpperCase();
  }

  async createPayment(order) {
    const params = {
      appid: this.appId,
      mch_id: this.mchId,
      nonce_str: this.generateNonceStr(),
      body: `${order.website_name} - ${order.full_hostname}`,
      out_trade_no: order.order_no,
      total_fee: Math.round(order.price * 100),
      spbill_create_ip: '127.0.0.1',
      notify_url: this.notifyUrl,
      trade_type: 'NATIVE'
    };

    const sign = this.generateSign(params);
    params.sign = sign;

    const xml = xmlbuilder.create('xml')
      .ele('xml')
      .ele(params)
      .end({ pretty: true });

    const codeUrl = await this.callUnifiedOrder(xml);
    const qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(codeUrl)}`;

    return {
      codeUrl,
      qrCode,
      prepayId: params.prepay_id,
      amount: order.price,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000)
    };
  }

  async callUnifiedOrder(xmlData) {
    return new Promise((resolve, reject) => {
      const https = require('https');
      const req = https.request(this.unifiedOrderUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
          'Content-Length': Buffer.byteLength(xmlData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const result = this.parseXmlResponse(data);
            if (result.return_code === 'SUCCESS' && result.result_code === 'SUCCESS') {
              resolve(result.code_url);
            } else {
              reject(new Error(result.return_msg || '微信支付下单失败'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(xmlData);
      req.end();
    });
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

  generateNonceStr() {
    return Math.random().toString(36).substr(2, 15);
  }

  parseXmlResponse(xmlString) {
    const xml2js = require('xml2js');
    const parser = new xml2js.Parser({ explicitArray: false, ignoreAttrs: true });
    let result = {};
    
    parser.parseString(xmlString, (err, parsed) => {
      if (!err && parsed.xml) {
        result = parsed.xml;
      }
    });

    return result;
  }
}

module.exports = WechatPayService;
