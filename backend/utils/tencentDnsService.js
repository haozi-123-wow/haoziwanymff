const tencentcloud = require("tencentcloud-sdk-nodejs");
const DnspodClient = tencentcloud.dnspod.v20210323.Client;
const { PlatformSetting, Domain } = require('../models');

class TencentDnsService {
  /**
   * 根据域名获取对应的腾讯云客户端
   * @param {string} domainName 域名
   * @returns {Promise<DnspodClient>}
   */
  async _getClient(domainName) {
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

      // 2. 初始化客户端
      const clientConfig = {
        credential: {
          secretId: setting.access_key_id || setting.secret_id,
          secretKey: setting.access_key_secret || setting.secret_key,
        },
        region: "", // DNSPod服务不需要region
        profile: {
          httpProfile: {
            endpoint: "dnspod.tencentcloudapi.com",
          },
        },
      };
      return new DnspodClient(clientConfig);
    } catch (error) {
      console.error(`Failed to initialize Tencent DNS client for domain ${domainName}:`, error);
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
    const client = await this._getClient(domainName);
    
    const params = {
      Domain: domainName,
      RecordType: type,
      RecordLine: "默认",
      Value: value,
      SubDomain: rr,
    };

    try {
      const result = await client.CreateRecord(params);
      return result;
    } catch (error) {
      console.error('Tencent DNS CreateRecord Error:', error);
      throw error;
    }
  }

  /**
   * 删除解析记录
   * 注意：需要提供 domainName 以便查找对应的 AccessKey
   * @param {string} domainName 域名名称
   * @param {string} recordId 解析记录ID
   * @returns {Promise<object>}
   */
  async deleteDomainRecord(domainName, recordId) {
    const client = await this._getClient(domainName);

    const params = {
      Domain: domainName,
      RecordId: Number(recordId),
    };

    try {
      const result = await client.DeleteRecord(params);
      return result;
    } catch (error) {
      console.error('Tencent DNS DeleteRecord Error:', error);
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
    const client = await this._getClient(domainName);

    const params = {
      Domain: domainName,
      Subdomain: rrSubDomain,
    };

    try {
      const result = await client.DescribeRecordList(params);
      return result;
    } catch (error) {
      console.error('Tencent DNS DescribeRecordList Error:', error);
      throw error;
    }
  }

  /**
   * 获取主域名的所有解析记录列表
   * @param {string} domainName 域名名称
   * @param {number} offset 偏移量
   * @param {number} limit 每页数量
   * @returns {Promise<object>}
   */
  async describeDomainRecords(domainName, offset = 0, limit = 20) {
    const client = await this._getClient(domainName);

    const params = {
      Domain: domainName,
      Offset: offset,
      Limit: limit,
    };

    try {
      const result = await client.DescribeRecordList(params);
      return result;
    } catch (error) {
      console.error('Tencent DNS DescribeRecordList Error:', error);
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
    const client = await this._getClient(domainName);

    const params = {
      Domain: domainName,
      RecordId: Number(recordId),
      RecordType: type,
      RecordLine: "默认",
      Value: value,
      SubDomain: rr,
    };

    try {
      const result = await client.ModifyRecord(params);
      return result;
    } catch (error) {
      console.error('Tencent DNS ModifyRecord Error:', error);
      throw error;
    }
  }
}

module.exports = new TencentDnsService();
