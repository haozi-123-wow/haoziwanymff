const axios = require('axios');
const { PlatformSetting, Domain } = require('../models');

class CloudflareDnsService {
  /**
   * 根据域名获取对应的Cloudflare配置
   * @param {string} domainName 域名
   * @returns {Promise<{apiToken: string, zoneId: string}>}
   */
  async _getConfig(domainName) {
    try {
      // 1. 查找域名对应的平台配置
      const domainRecord = await Domain.findOne({
        where: { domain: domainName },
        include: [{
          model: PlatformSetting,
          where: { is_active: true }
        }]
      });

      if (!domainRecord) {
        throw new Error(`Domain ${domainName} not found in database`);
      }

      const setting = domainRecord.PlatformSetting;
      if (!setting) {
        throw new Error(`Active platform setting not found for domain ${domainName}`);
      }

      // 2. 返回Cloudflare配置
      // Cloudflare使用 access_key_id 作为 API Token，access_key_secret 作为 Zone ID
      return {
        apiToken: setting.access_key_id,
        zoneId: setting.access_key_secret
      };
    } catch (error) {
      console.error(`Failed to get Cloudflare config for domain ${domainName}:`, error);
      throw error;
    }
  }

  /**
   * 添加解析记录
   * @param {string} domainName 域名名称
   * @param {string} rr 主机记录 (如: www, @, *)
   * @param {string} type 记录类型 (如: A, CNAME, TXT)
   * @param {string} value 记录值
   * @returns {Promise<object>}
   */
  async addDomainRecord(domainName, rr, type, value) {
    const { apiToken, zoneId } = await this._getConfig(domainName);

    // Cloudflare中，@表示根域名，需要用空字符串代替
    const name = rr === '@' ? '' : rr;

    const data = {
      type: type,
      name: name,
      content: value,
      ttl: 1, // 1 = 自动
      proxied: false // 默认不通过Cloudflare代理
    };

    try {
      const response = await axios.post(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudflare CreateRecord Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 删除解析记录
   * @param {string} domainName 域名名称
   * @param {string} recordId 解析记录ID
   * @returns {Promise<object>}
   */
  async deleteDomainRecord(domainName, recordId) {
    const { apiToken, zoneId } = await this._getConfig(domainName);

    try {
      const response = await axios.delete(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudflare DeleteRecord Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 获取子域名解析记录列表
   * @param {string} domainName 域名名称
   * @param {string} rrSubDomain 子域名 (如: www.example.com)
   * @returns {Promise<object>}
   */
  async describeSubDomainRecords(domainName, rrSubDomain) {
    const { apiToken, zoneId } = await this._getConfig(domainName);

    // 提取子域名部分（去除主域名）
    let name = rrSubDomain.replace(`.${domainName}`, '').toLowerCase();
    if (name === domainName) {
      name = '';
    }

    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            name: name || domainName,
            type: 'A' // 默认查询A记录，可以调整
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudflare DescribeRecordList Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 获取主域名的所有解析记录列表
   * @param {string} domainName 域名名称
   * @param {number} page 页码
   * @param {number} perPage 每页数量
   * @returns {Promise<object>}
   */
  async describeDomainRecords(domainName, page = 1, perPage = 20) {
    const { apiToken, zoneId } = await this._getConfig(domainName);

    try {
      const response = await axios.get(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            page: page,
            per_page: perPage
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudflare DescribeRecordList Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 修改解析记录
   * @param {string} domainName 域名名称
   * @param {string} recordId 解析记录ID
   * @param {string} rr 主机记录
   * @param {string} type 记录类型
   * @param {string} value 记录值
   * @returns {Promise<object>}
   */
  async modifyDomainRecord(domainName, recordId, rr, type, value) {
    const { apiToken, zoneId } = await this._getConfig(domainName);

    // Cloudflare中，@表示根域名，需要用空字符串代替
    const name = rr === '@' ? '' : rr;

    const data = {
      type: type,
      name: name,
      content: value,
      ttl: 1, // 1 = 自动
      proxied: false // 默认不通过Cloudflare代理
    };

    try {
      const response = await axios.put(
        `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${recordId}`,
        data,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Cloudflare ModifyRecord Error:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * 获取Cloudflare账户下的所有域名
   * @param {string} apiToken Cloudflare API Token
   * @param {number} page 页码
   * @param {number} perPage 每页数量
   * @returns {Promise<object>}
   */
  async listZones(apiToken, page = 1, perPage = 100) {
    try {
      console.log('调用 Cloudflare listZones，page:', page, 'perPage:', perPage);
      const response = await axios.get(
        'https://api.cloudflare.com/client/v4/zones',
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          },
          params: {
            page: page,
            per_page: perPage
          }
        }
      );
      console.log('Cloudflare listZones 返回:', JSON.stringify(response.data, null, 2));
      return response.data;
    } catch (error) {
      console.error('Cloudflare ListZones Error:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new CloudflareDnsService();
