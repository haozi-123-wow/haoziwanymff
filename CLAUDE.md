# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个前后端分离的二级域名分发系统：
- **后端**: Node.js + Express + MySQL + Redis + Sequelize
- **前端**: Vue 3 + TypeScript + Vite + Naive UI + UnoCSS
- **项目类型**: 二级域名分发管理平台

## 环境要求

### 后端 (backend/)
- Node.js ≥ 20.19.0
- pnpm ≥ 10.5.0
- MySQL ≥ 8.0
- Redis ≥ 6.0

### 前端 (admin/)
- Node.js ≥ 20.19.0
- pnpm ≥ 10.5.0

## 项目结构

```
haoziwanymff/
├── admin/                    # 前端管理后台 (Vue3 + TypeScript + Vite)
│   ├── src/                 # 源代码
│   ├── packages/            # monorepo 包
│   ├── build/               # 构建配置
│   └── public/              # 静态资源
├── backend/                 # 后端API服务 (Node.js + Express)
│   ├── config/              # 配置文件
│   ├── controllers/         # 控制器
│   ├── middleware/          # 中间件
│   ├── models/              # 数据模型
│   ├── routes/              # 路由定义
│   └── utils/               # 工具函数
└── 文档文件                 # 开发文档
```

## 常用开发命令

### 后端开发 (backend/)
```bash
# 安装依赖
cd backend
pnpm install

# 开发模式启动 (使用nodemon热重载)
pnpm run dev

# 生产模式启动
pnpm start

# 数据库种子脚本
pnpm run seed
```

### 前端开发 (admin/)
```bash
# 安装依赖
cd admin
pnpm install

# 开发模式启动 (端口9527)
pnpm run dev

# 生产环境开发模式
pnpm run dev:prod

# 构建生产版本
pnpm run build

# 构建测试版本
pnpm run build:test

# 预览构建结果 (端口9725)
pnpm run preview

# 代码检查与修复
pnpm run lint

# TypeScript类型检查
pnpm run typecheck

# Git提交 (符合Conventional Commits规范)
pnpm run commit

# 中文Git提交
pnpm run commit:zh

# 清理无用文件
pnpm run cleanup

# 生成路由
pnpm run gen-route

# 发布版本
pnpm run release

# 更新包
pnpm run update-pkg
```

## 数据库初始化

1. 创建MySQL数据库：
```sql
CREATE DATABASE haoziwanymff;
```

2. 运行初始化脚本：
```bash
# 执行 backend/init_database.sql
# 执行 backend/add_geetest_config.sql
# 执行 backend/add_timestamps_to_settings.sql
```

## 环境配置

### 后端环境变量 (backend/.env)
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-password
DB_NAME=haoziwanymff
REDIS_HOST=localhost
REDIS_PORT=6379
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
GEETEST_CAPTCHA_ID=your-captcha-id
GEETEST_CAPTCHA_KEY=your-captcha-key
GEETEST_API_SERVER=http://gcaptcha4.geetest.com
ACTIVATION_LINK_EXPIRES_HOURS=24
FRONTEND_URL=http://localhost:5173
```

### 前端环境变量 (admin/.env)
```env
VITE_APP_TITLE=Soybean Admin
VITE_APP_BASE_API=/api/v1
VITE_APP_MOCK_API=/mock/api
VITE_APP_AUTH_ROUTE_MODE=static
VITE_APP_ROUTE_HOME_PATH=/dashboard/workbench
VITE_APP_ICON_PREFIX=icon
VITE_APP_ICON_LOCAL_PREFIX=local
```

## 架构要点

### 后端架构
- **路由**: RESTful API，前缀 `/api/v1`
- **认证**: JWT + 极验人机验证
- **数据库**: Sequelize ORM + MySQL
- **缓存**: Redis
- **安全**: bcryptjs密码加密、helmet安全头、express-rate-limit速率限制
- **邮件**: nodemailer发送激活邮件

### 前端架构
- **框架**: Vue 3.5 + TypeScript
- **构建**: Vite 7.2 + UnoCSS
- **UI**: Naive UI 2.43
- **状态管理**: Pinia
- **路由**: Vue Router + Elegant Router (自动化文件路由)
- **HTTP**: Axios + @sa/axios封装
- **代码规范**: ESLint + Prettier + simple-git-hooks
- **项目结构**: pnpm monorepo

### 数据库模型
1. **users表**: 用户信息，支持激活机制和角色管理
2. **settings表**: 系统配置，JSON格式存储
3. **captchas表**: 验证令牌，支持极验验证
4. **domains表**: 域名管理，二级域名分发
5. **email_logs表**: 邮件日志

## API响应格式

所有API响应遵循统一结构：
```json
{
  "code": 0,
  "message": "success",
  "data": {},
  "timestamp": 1698765432000
}
```

状态码规范：
- `0`: 成功
- `1001`: 参数错误
- `1002`: 未授权
- `1003`: Token过期或无效
- `1004`: 资源已存在
- `1005`: 资源不存在
- `5000`: 服务器内部错误

## 开发规范

### Git提交规范
使用Conventional Commits规范：
```bash
# 使用内置命令生成规范的提交信息
pnpm run commit      # 英文
pnpm run commit:zh   # 中文
```

### 代码质量
- 前端：`pnpm run lint` + `pnpm run typecheck`
- 后端：遵循开发流程文档中的规范
- 提交前自动运行：类型检查 + ESLint + 代码格式化

## 安全特性

1. **人机验证**: 所有敏感操作需要极验验证
2. **JWT认证**: Token过期时间可配置
3. **密码加密**: bcryptjs加密存储
4. **速率限制**: API请求频率限制
5. **安全头**: helmet中间件增强安全性

## 部署说明

### 后端部署
```bash
cd backend
pnpm install --production
pnpm start
```

### 前端部署
```bash
cd admin
pnpm run build
# 将dist目录部署到Web服务器
```

## 文档资源

1. **后端开发流程**: `backend/开发流程文档.md`
2. **数据库设计**: `backend/数据库表结构设计.md`
3. **API文档**: `backend/api文档.md`
4. **前端说明**: `admin/README.md`

## 注意事项

1. 前后端都需要使用pnpm，不要使用npm或yarn
2. 数据库初始化需要按顺序执行SQL脚本
3. 极验验证需要配置正确的captcha_id和captcha_key
4. 邮件服务需要配置正确的SMTP信息
5. 前端路由使用自动化文件路由系统，路由生成使用`pnpm run gen-route`