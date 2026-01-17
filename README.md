# 二级域名分发系统

一个功能强大、安全稳定的二级域名分发管理系统，支持阿里云DNS和腾讯云DNSPod等主流云解析平台，提供完整的域名管理和用户认证功能。

## 项目简介

本系统是一个企业级的二级域名分发平台，可以帮助用户轻松管理和分发二级域名。系统支持多云服务商集成，提供完善的用户认证、权限管理和域名解析功能。

## 技术栈

### 后端
- **框架**: Node.js + Express.js
- **数据库**: MySQL (使用 Sequelize ORM)
- **缓存**: Redis
- **认证**: JWT (JSON Web Token)
- **安全**: Helmet, bcryptjs, express-rate-limit
- **验证**: Joi (数据验证), Geetest (人机验证)
- **DNS服务**: 阿里云DNS SDK, 腾讯云DNSPod SDK

### 前端
- **框架**: Vue 3 + TypeScript
- **构建工具**: Vite 7
- **UI组件**: Naive UI / Ant Design Vue / Element Plus
- **状态管理**: Pinia
- **样式**: UnoCSS
- **路由**: Elegant Router (自动化路由)
- **国际化**: 内置 i18n 支持

## 主要功能

### 用户认证
- 用户注册/登录
- JWT 身份认证
- 极验人机验证防护
- 密码加密存储（bcrypt）
- 邮箱验证码

### 域名管理
- 二级域名创建/编辑/删除
- 支持阿里云DNS和腾讯云DNSPod
- DNS记录自动同步
- 域名状态监控

### 系统管理
- 用户权限管理
- 系统配置管理
- 操作日志记录
- 请求频率限制
- 安全防护（Helmet、CORS）

## 项目结构

```
haoziwanymff/
├── admin/                 # 前端管理后台 (基于 SoybeanAdmin)
│   ├── src/              # 源代码
│   ├── public/           # 静态资源
│   ├── package.json      # 前端依赖配置
│   └── README.md         # 前端说明文档
├── backend/              # 后端服务
│   ├── config/           # 配置文件
│   │   ├── db.js         # 数据库配置
│   │   └── redis.js      # Redis配置
│   ├── controllers/      # 控制器
│   ├── middleware/       # 中间件
│   ├── models/           # 数据模型
│   ├── routes/           # 路由
│   ├── utils/            # 工具函数
│   ├── server.js         # 入口文件
│   ├── api文档.md        # API接口文档
│   └── package.json      # 后端依赖配置
├── node_modules/         # 依赖包
├── pnpm-lock.yaml        # 锁定文件
└── README.md             # 项目说明文档
```

## 快速开始

### 环境要求

- **Node.js**: >= 20.19.0
- **pnpm**: >= 10.5.0
- **MySQL**: >= 5.7
- **Redis**: >= 6.0

### 安装依赖

```bash
# 安装后端依赖
cd backend
pnpm install

# 安装前端依赖
cd ../admin
pnpm install
```

### 环境配置

#### 后端配置

在 `backend/` 目录下创建 `.env` 文件：

```env
# 服务器配置
PORT=3000
NODE_ENV=development

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_NAME=domain_distribution
DB_USER=root
DB_PASSWORD=your_password

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# 前端地址
FRONTEND_URL=http://localhost:5173

# 极验验证配置
GEETEST_CAPTCHA_ID=your_captcha_id
GEETEST_CAPTCHA_KEY=your_captcha_key

# 阿里云DNS配置
ALIYUN_ACCESS_KEY_ID=your_access_key_id
ALIYUN_ACCESS_KEY_SECRET=your_access_key_secret

# 腾讯云DNSPod配置
TENCENT_SECRET_ID=your_secret_id
TENCENT_SECRET_KEY=your_secret_key

# 邮箱配置
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your_email@example.com
SMTP_PASS=your_email_password
```

#### 前端配置

在 `admin/` 目录下配置 `.env` 文件（已有示例文件）。

### 数据库初始化

```bash
cd backend

# 导入数据库结构
mysql -u root -p < init_database.sql

# 或使用种子数据初始化
pnpm run seed
```

### 启动服务

#### 启动后端

```bash
cd backend
pnpm run dev    # 开发模式（使用nodemon）
# 或
pnpm start      # 生产模式
```

后端服务将运行在 `http://localhost:3000`

#### 启动前端

```bash
cd admin
pnpm dev
```

前端服务将运行在 `http://localhost:5173`

## API 文档

详细的 API 接口文档请查看：`backend/api文档.md`

### 主要 API 端点

- `GET /api/v1/captcha/config` - 获取极验验证配置
- `POST /api/v1/captcha/validate` - 极验二次验证
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `POST /api/v1/auth/logout` - 用户登出
- `GET /api/v1/domains` - 获取域名列表
- `POST /api/v1/domains` - 创建域名
- `PUT /api/v1/domains/:id` - 更新域名
- `DELETE /api/v1/domains/:id` - 删除域名

## 开发指南

### 代码规范

- 后端遵循 ESLint 规范
- 前端遵循 [SoybeanJS 规范](https://docs.soybeanjs.cn/zh/standard)
- 提交代码前请运行 `pnpm lint` 检查代码风格

### 数据库操作

- 使用 Sequelize ORM 进行数据库操作
- 数据模型定义在 `backend/models/` 目录
- 数据库迁移文件存放在 `backend/migrations/` 目录

### 添加新功能

1. **后端**:
   - 在 `models/` 创建数据模型
   - 在 `controllers/` 创建控制器
   - 在 `routes/` 添加路由
   - 在 `middleware/` 添加必要的中间件

2. **前端**:
   - 使用 `src/router/elegant-routes.ts` 自动生成路由
   - 在 `src/views/` 创建页面组件
   - 在 `src/service/` 添加 API 请求

### 测试

```bash
# 后端测试
cd backend
pnpm test

# 前端测试
cd admin
pnpm test
```

## 部署说明

### 后端部署

1. 设置环境变量 `NODE_ENV=production`
2. 确保生产环境数据库和 Redis 已配置
3. 使用 PM2 进行进程管理：

```bash
cd backend
pnpm install -g pm2
pm2 start server.js --name haoziwanymff-backend
pm2 save
pm2 startup
```

### 前端部署

```bash
cd admin
pnpm build
```

构建后的文件在 `admin/dist/` 目录，可以部署到 Nginx、CDN 或静态文件服务器。

## 安全建议

1. **生产环境必须**:
   - 使用 HTTPS
   - 修改默认的 JWT_SECRET
   - 配置强密码策略
   - 启用防火墙规则
   - 定期备份数据库

2. **推荐配置**:
   - 使用 Redis 集群提高可用性
   - 配置 MySQL 主从复制
   - 启用日志监控
   - 设置合理的速率限制

## 常见问题

### 数据库连接失败
检查 `.env` 文件中的数据库配置是否正确，确保 MySQL 服务正在运行。

### Redis 连接失败
确认 Redis 服务已启动，检查 `REDIS_HOST` 和 `REDIS_PORT` 配置。

### 极验验证失败
在 `backend/.env` 中配置正确的极验 `captcha_id` 和 `captcha_key`。

### DNS 接口调用失败
确保在阿里云/腾讯云控制台中配置了正确的 AccessKey 和权限。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 联系方式

- 作者: haoziwanymff
- 项目地址: [GitHub Repository](#)

## 致谢

感谢以下开源项目：

- [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) - 前端管理模板
- [Express.js](https://expressjs.com/) - Node.js Web 框架
- [Sequelize](https://sequelize.org/) - Node.js ORM
- [Naive UI](https://www.naiveui.com/) - Vue 3 UI 组件库

---

**注意**: 请勿在生产环境中使用默认配置和密钥，务必修改所有敏感信息！
