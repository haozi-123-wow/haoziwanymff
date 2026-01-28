const mysql = require('mysql2/promise');

async function addPriceAndIcpFields() {
  const connection = await mysql.createConnection({
    host: 'pc.haoziwan.cn',
    port: 3306,
    user: 'root',
    password: 'Haozi520',
    database: 'haoziwanymff'
  });

  try {
    console.log('连接数据库成功');

    // 检查price字段是否存在
    const [priceColumns] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE
        TABLE_SCHEMA = 'haoziwanymff'
        AND TABLE_NAME = 'domains'
        AND COLUMN_NAME = 'price'
    `);

    if (priceColumns[0].count === 0) {
      console.log('添加price字段...');
      await connection.execute(`
        ALTER TABLE domains
        ADD COLUMN \`price\` DECIMAL(10, 2) DEFAULT 0.00 COMMENT '域名使用价格' AFTER \`domain\`
      `);
      console.log('price字段添加成功');
    } else {
      console.log('price字段已存在，跳过');
    }

    // 检查require_icp字段是否存在
    const [icpColumns] = await connection.execute(`
      SELECT COUNT(*) as count
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE
        TABLE_SCHEMA = 'haoziwanymff'
        AND TABLE_NAME = 'domains'
        AND COLUMN_NAME = 'require_icp'
    `);

    if (icpColumns[0].count === 0) {
      console.log('添加require_icp字段...');
      await connection.execute(`
        ALTER TABLE domains
        ADD COLUMN \`require_icp\` BOOLEAN DEFAULT false COMMENT '是否需要备案' AFTER \`price\`
      `);
      console.log('require_icp字段添加成功');
    } else {
      console.log('require_icp字段已存在，跳过');
    }

    // 验证字段是否添加成功
    console.log('\n验证domains表字段...');
    const [columns] = await connection.execute(`
      SELECT
        COLUMN_NAME,
        DATA_TYPE,
        COLUMN_DEFAULT,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE
        TABLE_SCHEMA = 'haoziwanymff'
        AND TABLE_NAME = 'domains'
        AND COLUMN_NAME IN ('price', 'require_icp')
      ORDER BY COLUMN_NAME
    `);

    console.log('\ndomains表中的price和require_icp字段：');
    console.table(columns);

    console.log('\n✅ 操作完成');
  } catch (error) {
    console.error('执行失败:', error);
  } finally {
    await connection.end();
    console.log('数据库连接已关闭');
  }
}

addPriceAndIcpFields();
