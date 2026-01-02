const { User } = require('./models');
const bcrypt = require('bcrypt');

const seedUsers = async () => {
  try {
    console.log('开始创建测试用户...');

    const users = [
      {
        username: 'Super',
        email: 'super@haoziwanymff.com',
        password: '123456',
        role: 'admin',
        isActive: true
      },
      {
        username: 'Admin',
        email: 'admin@haoziwanymff.com',
        password: '123456',
        role: 'admin',
        isActive: true
      },
      {
        username: 'User',
        email: 'user@haoziwanymff.com',
        password: '123456',
        role: 'user',
        isActive: true
      }
    ];

    for (const userData of users) {
      const existingUser = await User.findOne({
        where: {
          [require('sequelize').Op.or]: [
            { username: userData.username },
            { email: userData.email }
          ]
        }
      });

      if (existingUser) {
        console.log(`用户 ${userData.username} 已存在，跳过创建`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);

      await User.create({
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        role: userData.role,
        isActive: userData.isActive
      });

      console.log(`✅ 用户 ${userData.username} 创建成功`);
    }

    console.log('\n所有测试用户创建完成！');
    console.log('\n测试账号列表：');
    console.log('----------------------------------------');
    users.forEach(user => {
      console.log(`用户名: ${user.username}`);
      console.log(`邮箱: ${user.email}`);
      console.log(`密码: ${user.password}`);
      console.log(`角色: ${user.role}`);
      console.log('----------------------------------------');
    });

    process.exit(0);
  } catch (error) {
    console.error('创建测试用户失败:', error);
    process.exit(1);
  }
};

seedUsers();
