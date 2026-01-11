/**
 * 测试获取用户列表 API
 * 运行方式: node test_getUsers.js
 */

const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api/v1';

// 测试数据
const TEST_TOKEN = 'YOUR_ADMIN_TOKEN_HERE'; // 需要替换为实际的管理员 token

async function testGetUsers() {
  try {
    console.log('开始测试获取用户列表 API...\n');

    // 测试1: 获取第一页用户列表（无关键词）
    console.log('测试1: 获取第一页用户列表（无关键词）');
    const response1 = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: {
        page: 1,
        pageSize: 10
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('响应状态:', response1.status);
    console.log('响应数据:', JSON.stringify(response1.data, null, 2));
    console.log('\n---\n');

    // 测试2: 获取第二页用户列表
    console.log('测试2: 获取第二页用户列表');
    const response2 = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: {
        page: 2,
        pageSize: 5
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('响应状态:', response2.status);
    console.log('响应数据:', JSON.stringify(response2.data, null, 2));
    console.log('\n---\n');

    // 测试3: 使用关键词搜索用户
    console.log('测试3: 使用关键词搜索用户');
    const response3 = await axios.get(`${API_BASE_URL}/admin/users`, {
      params: {
        page: 1,
        pageSize: 10,
        keyword: 'admin'
      },
      headers: {
        'Authorization': `Bearer ${TEST_TOKEN}`
      }
    });

    console.log('响应状态:', response3.status);
    console.log('响应数据:', JSON.stringify(response3.data, null, 2));
    console.log('\n---\n');

    console.log('所有测试完成！');

  } catch (error) {
    if (error.response) {
      console.error('请求失败，状态码:', error.response.status);
      console.error('错误响应:', JSON.stringify(error.response.data, null, 2));
    } else if (error.request) {
      console.error('未收到响应:', error.message);
    } else {
      console.error('请求配置错误:', error.message);
    }
  }
}

// 运行测试
if (require.main === module) {
  console.log('提示: 请先将 TEST_TOKEN 替换为实际的管理员 token\n');
  testGetUsers();
}

module.exports = { testGetUsers };