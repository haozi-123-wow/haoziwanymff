# 获取用户列表 API 实现说明

## 接口信息

- **接口地址**: `GET /api/v1/admin/users`
- **是否需要认证**: 是（需要管理员权限）
- **实现文件**: `backend/controllers/adminController.js`
- **路由文件**: `backend/routes/admin.js`

## 功能特性

✅ **已实现的功能**:
1. 分页查询用户列表
2. 支持关键词搜索（用户名或邮箱）
3. 排除密码字段返回
4. 按创建时间降序排序
5. 返回总数、当前页码、每页数量
6. 需要管理员权限认证

## 请求参数

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| keyword | string | 否 | 搜索关键词（用户名或邮箱） | - |

## 请求头

```
Authorization: Bearer <token>
```

## 响应格式

### 成功响应 (200)
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1001,
        "username": "admin_user",
        "email": "admin@example.com",
        "isActive": true,
        "isBanned": false,
        "role": "admin",
        "createdAt": "2023-10-30T12:00:00.000Z",
        "updatedAt": "2023-10-30T12:00:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1698765432000
}
```

### 错误响应

#### 401 未授权
```json
{
  "code": 1003,
  "message": "未授权访问",
  "data": null,
  "timestamp": 1698765432000
}
```

#### 403 权限不足
```json
{
  "code": 1004,
  "message": "权限不足，需要管理员权限",
  "data": null,
  "timestamp": 1698765432000
}
```

#### 500 服务器错误
```json
{
  "code": 5000,
  "message": "服务器内部错误",
  "data": null,
  "timestamp": 1698765432000
}
```

## 代码实现

### Controller 层 (`backend/controllers/adminController.js:421`)

```javascript
const getUsers = async (req, res) => {
  try {
    const { page = 1, pageSize = 10, keyword = '' } = req.query;

    const offset = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    const whereCondition = {};
    if (keyword) {
      whereCondition[Op.or] = [
        { username: { [Op.like]: `%${keyword}%` } },
        { email: { [Op.like]: `%${keyword}%` } }
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password'] }, // 排除密码字段
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      code: 0,
      message: 'success',
      data: {
        list: rows,
        total: count,
        page: parseInt(page),
        pageSize: limit
      },
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      code: 5000,
      message: error.message || '服务器内部错误',
      data: null,
      timestamp: Date.now()
    });
  }
};
```

### Router 层 (`backend/routes/admin.js:22`)

```javascript
// 获取用户列表
router.get('/users', getUsers);
```

### 主路由 (`backend/routes/index.js:21`)

```javascript
// 管理员相关路由（需要管理员权限）
router.use('/admin', authenticateToken, requireAdmin, adminRoutes);
```

## 测试方法

### 使用 curl 测试

```bash
# 1. 首先登录获取 token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"your_password"}'

# 2. 使用获取的 token 调用用户列表接口
curl -X GET "http://localhost:3000/api/v1/admin/users?page=1&pageSize=10" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# 3. 使用关键词搜索
curl -X GET "http://localhost:3000/api/v1/admin/users?keyword=admin" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 使用 Postman 测试

1. 设置请求方法为 `GET`
2. 输入 URL: `http://localhost:3000/api/v1/admin/users`
3. 在 Headers 中添加:
   - `Authorization`: `Bearer YOUR_TOKEN_HERE`
4. 在 Query Params 中添加参数:
   - `page`: 1
   - `pageSize`: 10
   - `keyword`: (可选)

### 使用测试脚本

```bash
cd backend
# 编辑 test_getUsers.js，将 TEST_TOKEN 替换为实际 token
node test_getUsers.js
```

## 数据库字段说明

User 模型返回的字段（已排除 password）:

| 字段名 | 类型 | 说明 |
| :--- | :--- | :--- |
| id | number | 用户ID |
| username | string | 用户名 |
| email | string | 邮箱 |
| isActive | boolean | 是否激活 |
| isBanned | boolean | 是否封禁 |
| banReason | string | 封禁原因（可选） |
| activationToken | string | 激活令牌（可选） |
| activationTokenExpires | Date | 激活令牌过期时间（可选） |
| role | string | 用户角色 (user/admin) |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

## 注意事项

1. **权限要求**: 此接口需要管理员权限，普通用户无法访问
2. **密码安全**: 返回数据中已排除密码字段，确保安全性
3. **分页限制**: 建议前端限制 pageSize 的最大值，防止一次性查询过多数据
4. **搜索功能**: 关键词搜索支持模糊匹配，同时搜索用户名和邮箱
5. **时间格式**: 返回的时间字段为 ISO 8601 格式

## 扩展建议

如果需要进一步扩展功能，可以考虑：

1. **添加筛选条件**: 按角色筛选、按激活状态筛选、按封禁状态筛选
2. **添加排序功能**: 支持按不同字段排序
3. **添加导出功能**: 导出用户列表为 Excel 或 CSV
4. **添加统计功能**: 返回用户总数、激活用户数、封禁用户数等统计信息
5. **添加批量操作**: 批量激活、批量封禁等

## 相关文件

- `backend/controllers/adminController.js` - 控制器实现
- `backend/routes/admin.js` - 路由定义
- `backend/routes/index.js` - 主路由
- `backend/models/User.js` - 用户模型
- `backend/middleware/auth.js` - 认证中间件
- `backend/api文档.md` - API 文档