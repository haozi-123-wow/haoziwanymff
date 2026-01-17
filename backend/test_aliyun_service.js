const aliyunDnsService = require('./utils/aliyunDnsService');

console.log('AliyunDnsService loaded successfully');
if (typeof aliyunDnsService.addDomainRecord === 'function') {
  console.log('addDomainRecord method exists');
}
process.exit(0);
