# Haoziwanymff 项目说明

## 项目概述

Haoziwanymff 是一个全栈的二级域名分发管理系统，包含前端管理后台和后端 API 服务。

- **前端**: 基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 模板构建，使用 Vue3 + Vite7 + TypeScript + NaiveUI + UnoCSS 技术栈
- **后端**: 基于 Node.js + Express + MySQL + Redis 构建，提供 RESTful API 服务

### 项目结构

```
haoziwanymff/
├── admin/              # 前端管理后台 (基于 SoybeanAdmin)
│   ├── src/            # 源代码
│   ├── packages/       # monorepo 包
│   ├── public/         # 静态资源
│   ├── build/          # 构建配置
│   └── package.json    # 前端依赖配置
├── backend/            # 后端 API 服务
│   ├── config/         # 配置文件 (数据库、Redis)
│   ├── controllers/    # 控制器
│   ├── middleware/     # 中间件
│   ├── models/         # 数据模型
│   ├── routes/         # 路由定义
│   ├── utils/          # 工具函数
│   ├── uploads/        # 上传文件目录
│   └── server.js       # 服务器入口
└── wendang/            # 项目文档
```

## 前端 (admin/)

### 技术栈
- **框架**: Vue 3.5.25
- **构建工具**: Vite 7.2.6
- **语言**: TypeScript 5.9.3
- **UI 组件库**: NaiveUI 2.43.2
- **样式**: UnoCSS, Sass
- **状态管理**: Pinia 3.0.4
- **路由**: Vue Router 4.6.3
- **国际化**: Vue I18n 11.2.2
- **HTTP 客户端**: Axios (通过 @sa/axios 包)
- **包管理器**: pnpm (monorepo 架构)

### 环境要求
- Node.js >= 20.19.0
- pnpm >= 10.5.0

### 常用命令

```bash
# 进入前端目录
cd admin

# 安装依赖
pnpm i

# 启动开发服务器 (默认端口: 9527)
pnpm dev

# 构建生产版本
pnpm build

# 构建测试版本
pnpm build:test

# 类型检查
pnpm typecheck

# 代码检查和修复
pnpm lint

# 预览构建结果
pnpm preview

# Git 提交 (使用 commitlint 规范)
pnpm commit

# 生成路由
pnpm gen-route
```

### 开发规范
- 遵循 [SoybeanJS 规范](https://docs.soybeanjs.cn/zh/standard)
- 使用 ESLint + Prettier 进行代码规范检查
- Git 提交遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范
- 使用 simple-git-hooks 进行 Git 钩子管理
- pre-commit 钩子会自动执行 `pnpm typecheck && pnpm lint`

### 项目特性
- 自动化文件路由系统 (基于 Elegant Router)
- 支持前端静态路由和后端动态路由
- 内置国际化方案
- 丰富的主题配置
- 移动端适配
- 内置命令行工具

### API 请求配置
- 基础 URL: 通过环境变量配置 (VITE_BASE_URL)
- 代理配置: 开发环境支持 HTTP 代理 (VITE_HTTP_PROXY)
- 认证方式: JWT Bearer Token
- 响应格式: `{ code: 0, message: "success", data: {}, timestamp: 1698765432000 }`

### 环境变量
- `VITE_BASE_URL`: 应用基础路径
- `VITE_HTTP_PROXY`: 是否启用 HTTP 代理 (Y/N)
- `VITE_SERVICE_SUCCESS_CODE`: 后端成功状态码 (默认: 0)
- `VITE_SERVICE_LOGOUT_CODES`: 登出状态码 (逗号分隔)
- `VITE_SERVICE_MODAL_LOGOUT_CODES`: 模态框登出状态码 (逗号分隔)
- `VITE_SERVICE_EXPIRED_TOKEN_CODES`: Token 过期状态码 (逗号分隔)
- `VITE_SOURCE_MAP`: 是否生成 source map (Y/N)

## 后端 (backend/)

### 技术栈
- **运行时**: Node.js >= 20.19.0
- **框架**: Express 4.18.2
- **ORM**: Sequelize 6.32.1
- **数据库**: MySQL 8.0+ (通过 mysql2 3.6.0)
- **缓存**: Redis 6.0+ (通过 redis 4.6.7)
- **认证**: JWT (jsonwebtoken 9.0.2)
- **密码加密**: bcryptjs 2.4.3
- **验证**: Joi 17.9.2
- **邮件**: Nodemailer 6.9.4
- **人机验证**: 极验 Geetest
- **文件上传**: Multer 2.0.2
- **安全**: Helmet 7.0.0
- **限流**: express-rate-limit 6.10.0
- **CORS**: cors 2.8.5

### 环境要求
- Node.js >= 20.19.0
- MySQL >= 8.0
- Redis >= 6.0

### 常用命令

```bash
# 进入后端目录
cd backend

# 安装依赖
pnpm install

# 启动开发服务器 (默认端口: 3000)
pnpm run dev

# 启动生产服务器
pnpm start

# 初始化数据库种子数据
pnpm run seed
```

### 环境配置 (.env)

```bash
# 服务器配置
PORT=3000

# 数据库配置
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-mysql-password
DB_NAME=haoziwanymff

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# 邮件服务配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 极验验证配置
GEETEST_CAPTCHA_ID=647f5ed2ed8acb4be36784e01556bb71
GEETEST_CAPTCHA_KEY=b09a7aafbfd83f73b35a9b530d0337bf
GEETEST_API_SERVER=http://gcaptcha4.geetest.com

# 激活链接配置
ACTIVATION_LINK_EXPIRES_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### API 规范
- **基础路径**: `/api/v1`
- **认证方式**: JWT Bearer Token (`Authorization: Bearer <token>`)
- **响应格式**:
  ```json
  {
    "code": 0,
    "message": "success",
    "data": {},
    "timestamp": 1698765432000
  }
  ```
- **状态码**:
  - `0`: Success
  - `1001`: 参数错误
  - `1002`: 未授权
  - `1003`: Token 过期或无效
  - `1004`: 资源已存在
  - `1005`: 资源不存在
  - `5000`: 服务器内部错误

### 主要 API 模块

#### 认证模块 (/api/v1/auth)
- `POST /register` - 用户注册 (需要极验验证)
- `GET /activate/:token` - 激活账户
- `POST /login` - 密码登录 (需要极验验证)
- `POST /login-with-code` - 邮箱验证码登录
- `POST /logout` - 用户登出
- `POST /email-code` - 发送邮箱验证码
- `POST /reset-password` - 找回密码

#### 用户模块 (/api/v1/user)
- `GET /me` - 获取当前用户信息 (需认证)
- `PATCH /email` - 更改绑定邮箱 (需认证)

#### 极验验证模块 (/api/v1/captcha)
- `GET /config` - 获取验证配置参数
- `POST /validate` - 极验二次验证
- `POST /dev/validate-token` - 开发环境快速获取验证令牌

#### 管理员模块 (/api/v1/admin)
- `GET /settings` - 获取网站设置 (需管理员权限)
- `PUT /settings` - 更新网站设置 (需管理员权限)
- `POST /test-email` - 测试邮件配置 (需管理员权限)
- `GET /users` - 获取用户列表 (需管理员权限)
- `PUT /users/:userId/status` - 更新用户状态 (需管理员权限)

### 安全措施
- Helmet 安全头中间件
- JWT 认证机制
- bcrypt 密码加密
- express-rate-limit 速率限制 (15分钟内最多100次请求)
- 极验人机验证
- CORS 跨域配置

### 数据库设计

#### 主要数据表
- **users**: 用户表 (用户名、邮箱、密码、角色、激活状态等)
- **settings**: 系统设置表 (网站配置、邮件配置等)
- **captchas**: 验证令牌表 (极验验证令牌)
- **domains**: 域名表 (二级域名分发)
- **email_logs**: 邮件日志表 (邮件发送记录)

#### 初始化数据库
```bash
# 进入后端目录
cd backend

# 执行初始化 SQL 脚本
mysql -u root -p < init_database.sql
```

### 项目架构
- **config/**: 配置模块 (数据库、Redis 连接配置)
- **controllers/**: 控制器 (业务逻辑处理)
- **middleware/**: 中间件 (认证、权限验证、文件上传)
- **models/**: 数据模型 (Sequelize 模型定义)
- **routes/**: 路由 (API 端点定义)
- **utils/**: 工具函数 (极验服务、邮件服务)

## 开发流程

### 首次运行

1. **启动数据库服务**
   ```bash
   # 启动 MySQL
   # 启动 Redis
   ```

2. **配置后端环境**
   ```bash
   cd backend
   cp .env.example .env  # 如果有示例文件
   # 编辑 .env 文件，配置数据库、Redis、邮件等信息
   pnpm install
   pnpm run seed  # 初始化数据库种子数据
   pnpm run dev   # 启动后端服务 (端口 3000)
   ```

3. **配置前端环境**
   ```bash
   cd admin
   pnpm install
   pnpm dev  # 启动前端服务 (端口 9527)
   ```

### 日常开发

1. **开发新功能**
   - 后端: 修改 `backend/` 目录下的代码
   - 前端: 修改 `admin/src/` 目录下的代码
   - 前端页面路由: 在 `admin/src/views/` 下创建页面，路由会自动生成

2. **代码规范检查**
   ```bash
   # 前端
   cd admin
   pnpm typecheck
   pnpm lint

   # 后端 (TODO: 添加 ESLint 配置)
   ```

3. **Git 提交**
   ```bash
   # 前端
   cd admin
   pnpm commit  # 使用交互式提交工具

   # 后端
   git add .
   git commit -m "feat: 添加新功能"
   ```

## 文档资源

- **前端文档**: [SoybeanAdmin 文档](https://docs.soybeanjs.cn)
- **API 文档**: `backend/api文档.md`
- **开发流程**: `backend/开发流程文档.md`
- **数据库设计**: `backend/数据库表结构设计.md`

## 注意事项

### 前端开发
- 使用 pnpm 作为包管理器，不要使用 npm 或 yarn
- 遵循项目目录结构，新页面放在 `src/views/` 下
- API 请求使用 `src/service/request/index.ts` 中配置的 request 实例
- 状态管理使用 Pinia，store 定义在 `src/store/modules/` 下
- 组件放在 `src/components/` 下，按功能分类

### 后端开发
- 所有 API 路径以 `/api/v1` 开头
- 使用 Sequelize ORM 进行数据库操作
- 敏感操作需要极验验证
- 需要认证的接口使用 `authenticateToken` 中间件
- 需要管理员权限的接口使用 `requireAdmin` 中间件
- 错误响应统一使用标准格式

### 安全考虑
- 不要在代码中硬编码敏感信息
- 使用环境变量管理配置
- 密码必须使用 bcrypt 加密
- JWT Token 有过期时间限制
- 实施速率限制防止暴力破解
- 验证所有用户输入

## 常见问题

### 前端问题
- **依赖安装失败**: 确保使用 pnpm，版本 >= 10.5.0
- **端口被占用**: 修改 `vite.config.ts` 中的端口号
- **API 请求失败**: 检查后端服务是否启动，检查代理配置

### 后端问题
- **数据库连接失败**: 检查 MySQL 服务是否启动，检查 .env 配置
- **Redis 连接失败**: 检查 Redis 服务是否启动，检查 .env 配置
- **极验验证失败**: 检查极验配置参数是否正确
- **邮件发送失败**: 检查 SMTP 配置，检查邮箱是否开启应用密码

## 许可证

MIT License