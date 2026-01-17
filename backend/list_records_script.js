const aliyunDnsService = require('./utils/aliyunDnsService');
const { Domain, PlatformSetting, sequelize } = require('./models');

async function listDomainRecords() {
  // 假设我们要查询的域名是 'haoziwan.com' (请根据实际数据库中的域名修改)
  // 如果没有从命令行参数传入，默认查找第一个域名
  let domainName = process.argv[2];

  try {
    if (!domainName) {
      console.log('No domain name provided, finding first available domain in database...');
      const domain = await Domain.findOne();
      if (!domain) {
        console.error('No domains found in database. Please add a domain first.');
        process.exit(1);
      }
      domainName = domain.domain;
      console.log(`Using domain: ${domainName}`);
    }

    console.log(`Fetching records for domain: ${domainName}...`);
    const response = await aliyunDnsService.describeDomainRecords(domainName);
    
    if (response && response.domainRecords && response.domainRecords.record) {
      const records = response.domainRecords.record;
      console.log(`Found ${response.totalCount} records:`);
      console.table(records.map(r => ({
        RR: r.RR,
        Type: r.type,
        Value: r.value,
        TTL: r.TTL,
        Status: r.status,
        RecordId: r.recordId
      })));
    } else {
      console.log('No records found or unexpected response structure.');
      console.log(JSON.stringify(response, null, 2));
    }

  } catch (error) {
    console.error('Error listing domain records:', error.message);
  } finally {
    await sequelize.close();
  }
}

listDomainRecords();
