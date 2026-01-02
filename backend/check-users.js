const { User } = require('./models');
const bcrypt = require('bcryptjs');

const checkUsers = async () => {
  try {
    console.log('正在查询数据库中的用户...\n');

    const users = await User.findAll({
      attributes: ['id', 'username', 'email', 'password', 'isActive', 'role']
    });

    if (users.length === 0) {
      console.log('数据库中没有用户！');
      process.exit(0);
    }

    console.log(`找到 ${users.length} 个用户：\n`);

    for (const user of users) {
      console.log('----------------------------------------');
      console.log(`ID: ${user.id}`);
      console.log(`用户名: ${user.username}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`是否激活: ${user.isActive ? '是' : '否'}`);
      console.log(`角色: ${user.role}`);
      console.log(`密码哈希: ${user.password.substring(0, 30)}...`);

      // 测试密码验证
      const testPasswords = ['SecurePass123', '123456'];
      for (const testPwd of testPasswords) {
        const isValid = await bcrypt.compare(testPwd, user.password);
        console.log(`  密码 "${testPwd}" 验证: ${isValid ? '✅ 正确' : '❌ 错误'}`);
      }
      console.log('----------------------------------------\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('查询用户失败:', error);
    process.exit(1);
  }
};

checkUsers();