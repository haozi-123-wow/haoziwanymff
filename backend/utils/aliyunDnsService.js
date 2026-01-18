const Alidns20150109 = require('@alicloud/alidns20150109');
const OpenApi = require('@alicloud/openapi-client');
const Util = require('@alicloud/tea-util');
const { PlatformSetting, Domain } = require('../models');

class AliyunDnsService {
  /**
   * 根据域名获取对应的阿里云客户端
   * @param {string} domainName 域名
   * @returns {Promise<Alidns20150109.default>}
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
      const config = new OpenApi.Config({
        accessKeyId: setting.access_key_id,
        accessKeySecret: setting.access_key_secret,
      });
      config.endpoint = `alidns.cn-hangzhou.aliyuncs.com`;
      return new Alidns20150109.default(config);
    } catch (error) {
      console.error(`Failed to initialize Aliyun DNS client for domain ${domainName}:`, error);
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
    
    const addDomainRecordRequest = new Alidns20150109.AddDomainRecordRequest({
      domainName: domainName,
      rR: rr,
      type: type,
      value: value,
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      const result = await client.addDomainRecordWithOptions(addDomainRecordRequest, runtime);
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS AddDomainRecord Error:', error);
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

    const deleteDomainRecordRequest = new Alidns20150109.DeleteDomainRecordRequest({
      recordId: recordId,
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      const result = await client.deleteDomainRecordWithOptions(deleteDomainRecordRequest, runtime);
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS DeleteDomainRecord Error:', error);
      throw error;
    }
  }

  /**
   * 修改解析记录
   * 注意：需要提供 domainName 以便查找对应的 AccessKey
   * @param {string} domainName 域名名称
   * @param {string} recordId 解析记录ID
   * @param {string} rr 主机记录 (如: www, @, *)
   * @param {string} type 记录类型 (如: A, CNAME, TXT)
   * @param {string} value 记录值
   * @returns {Promise<object>}
   */
  async modifyDomainRecord(domainName, recordId, rr, type, value) {
    const client = await this._getClient(domainName);

    const updateDomainRecordRequest = new Alidns20150109.UpdateDomainRecordRequest({
      recordId: recordId,
      rR: rr,
      type: type,
      value: value,
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      const result = await client.updateDomainRecordWithOptions(updateDomainRecordRequest, runtime);
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS UpdateDomainRecord Error:', error);
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

    const describeSubDomainRecordsRequest = new Alidns20150109.DescribeSubDomainRecordsRequest({
      domainName: domainName,
      subDomain: rrSubDomain
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      const result = await client.describeSubDomainRecordsWithOptions(describeSubDomainRecordsRequest, runtime);
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS DescribeSubDomainRecords Error:', error);
      throw error;
    }
  }

  /**
   * 获取主域名的所有解析记录列表
   * @param {string} domainName 域名名称
   * @param {number} pageNumber 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<object>}
   */
  async describeDomainRecords(domainName, pageNumber = 1, pageSize = 20) {
    const client = await this._getClient(domainName);

    const describeDomainRecordsRequest = new Alidns20150109.DescribeDomainRecordsRequest({
      domainName: domainName,
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      const result = await client.describeDomainRecordsWithOptions(describeDomainRecordsRequest, runtime);
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS DescribeDomainRecords Error:', error);
      throw error;
    }
  }

  /**
   * 获取阿里云账户下的所有域名
   * @param {string} accessKeyId 阿里云 AccessKeyId
   * @param {string} accessKeySecret 阿里云 AccessKeySecret
   * @param {number} pageNumber 页码
   * @param {number} pageSize 每页数量
   * @returns {Promise<object>}
   */
  async describeDomains(accessKeyId, accessKeySecret, pageNumber = 1, pageSize = 100) {
    const config = new OpenApi.Config({
      accessKeyId: accessKeyId,
      accessKeySecret: accessKeySecret,
    });
    config.endpoint = `alidns.cn-hangzhou.aliyuncs.com`;
    const client = new Alidns20150109.default(config);

    const describeDomainsRequest = new Alidns20150109.DescribeDomainsRequest({
      pageNumber: pageNumber,
      pageSize: pageSize
    });

    const runtime = new Util.RuntimeOptions({});
    try {
      console.log('调用阿里云 DescribeDomains，参数:', { pageNumber, pageSize });
      const result = await client.describeDomainsWithOptions(describeDomainsRequest, runtime);
      console.log('阿里云 DescribeDomains 返回:', JSON.stringify(result.body, null, 2));
      return result.body;
    } catch (error) {
      console.error('Aliyun DNS DescribeDomains Error:', error);
      throw error;
    }
  }
}

module.exports = new AliyunDnsService();
