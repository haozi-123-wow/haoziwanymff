api文档.md
您好，我是后端开发专家。基于您的需求，我们将构建一个基于 Node.js 的二级域名分发系统。这是一个典型的基础设施服务，对稳定性和安全性要求极高。

遵循我们的工作流程，首先我们需要确立API设计的**通用规范**，以确保前后端交互的一致性。随后，我们将实现最基础的**用户认证模块**，这是系统安全的第一道防线。

以下是为您设计的更新版 API 文档：

---

# 二级域名分发系统 API 文档 (V1.0)

## 1. API 设计规范

为了确保系统的高可读性和可维护性，所有 API 接口必须严格遵循以下规范。

### 1.1 协议与数据格式
*   **协议**: 使用 `HTTPS` 进行传输，确保数据在传输过程中的加密安全。
*   **数据格式**: 统一使用 `JSON` 格式。
*   **字符编码**: `UTF-8`。

### 1.2 请求规范 (RESTful风格)
*   **API 前缀**: 所有接口路径以 `/api/v1` 开头，便于后续版本迭代。
*   **HTTP 方法**:
    *   `GET`: 获取资源。
    *   `POST`: 创建新资源。
    *   `PUT`: 更新资源的全部信息。
    *   `PATCH`: 更新资源的部分信息。
    *   `DELETE`: 删除资源。

### 1.3 响应体统一结构
无论请求成功与否，响应体必须包含以下标准字段：

```json
{
  "code": 0,           // 业务状态码，0 表示成功，非 0 表示业务错误
  "message": "success", // 提示信息，成功时通常为 "success" 或具体描述
  "data": {},          // 具体的业务数据，若无数据则为 null 或 {}
  "timestamp": 1698765432000 // 服务器时间戳
}
```

### 1.4 通用业务状态码
*   `0`: Success
*   `1001`: 参数错误
*   `1002`: 未授权
*   `1003`: Token 过期或无效
*   `1004`: 资源已存在
*   `1005`: 资源不存在
*   `5000`: 服务器内部错误

### 1.5 身份认证
*   本系统采用 `JWT (JSON Web Token)` 进行无状态身份认证。
*   用户登录成功后，服务器返回 `access_token`。
*   客户端需在后续需要认证的请求 `Header` 中添加：`Authorization: Bearer <access_token>`。

---

## 2. 极验人机验证模块

为防止恶意注册和登录，系统集成了极验人机验证（Geetest），确保操作由真实用户完成。

### 2.1 获取验证配置参数
**开发状态**: ✅ 已完成（`captchaController.getCaptchaConfig`）

用于前端初始化极验验证组件，获取验证所需的配置信息。


*   **接口地址**: `GET /api/v1/captcha/config`
*   **是否需要认证**: 否
*   **请求参数**: 无

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "captchaId": "647f5ed2ed8acb4be36784e01556bb71",
    "timestamp": 1698765432000
  },
  "timestamp": 1698765432000
}
```

---

### 2.2 极验二次验证
**开发状态**: ✅ 已完成（`captchaController.validateCaptcha`）

当用户在前端完成人机验证后，前端将验证参数发送到此接口，系统再将这些参数上传到极验二次校验接口，确认用户验证的有效性。


*   **接口地址**: `POST /api/v1/captcha/validate`
*   **是否需要认证**: 否
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| lot_number | string | 是 | 验证流水号 |
| captcha_output | string | 是 | 验证输出信息 |
| pass_token | string | 是 | 验证通过标识 |
| gen_time | string | 是 | 验证通过时间戳 |

*   **请求示例**:
```json
{
  "lot_number": "4dc3cfc2cdff448cad8d13107198d473",
  "captcha_output": "9a6641983111910a2e4a15827e440f0a1565c39f3a1b2502a18d30b5e4162754",
  "pass_token": "30b5e41627544dc3cfc2cdff448cad8d13107198",
  "gen_time": "1698765432000"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "验证通过",
  "data": {
    "result": "success",
    "validate_token": "validation_success_token_abc123"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (验证失败)**:
```json
{
  "code": 1002,
  "message": "人机验证失败",
  "data": {
    "result": "fail",
    "reason": "pass_token expire"
  },
  "timestamp": 1698765432000
}
```

---

### 2.3（开发环境）快速获取 validate_token
**开发状态**: ✅ 已完成（`captchaController.issueDevValidateToken`）

仅在本地或测试环境启用，帮助开发人员无需真实极验请求即可获得短期有效的 `validate_token`。

> ⚠️ **安全提示**：当 `NODE_ENV=production` 且 `ALLOW_DEV_CAPTCHA` 未置为 `true` 时此接口自动禁用。

*   **接口地址**: `POST /api/v1/captcha/dev/validate-token`
*   **是否需要认证**: 否（若启用则默认非生产环境）
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| expiresInMinutes | number | 否 | 令牌有效期（1-60，默认10分钟） |

*   **响应示例**:
```json
{
  "code": 0,
  "message": "开发环境 validate_token 生成成功",
  "data": {
    "validate_token": "mock_token_for_dev_only",
    "expiresInMinutes": 10
  },
  "timestamp": 1698765432000
}
```

---

## 3. 用户认证模块


这是系统的入口，提供用户注册、登录及获取当前用户信息的功能。

### 3.1 用户注册
**开发状态**: ✅ 已完成（`authController.register`）

用于创建新用户账号。系统需对密码进行加密处理（推荐使用 `bcrypt`）并发送激活邮件。新增了极验人机验证要求。


*   **接口地址**: `POST /api/v1/auth/register`
*   **是否需要认证**: 否
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 | 约束 |
| :--- | :--- | :--- | :--- | :--- |
| username | string | 是 | 用户名 | 3-20位字母数字下划线 |
| email | string | 是 | 邮箱地址 | 必须符合邮箱格式 |
| password | string | 是 | 用户密码 | 6-32位，建议包含大小写字母和数字 |
| validate_token | string | 是 | 极验验证通过后返回的令牌 | 需要先完成人机验证 |

*   **请求示例**:
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "SecurePass123!",
  "validate_token": "validation_success_token_abc123"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "注册成功，请检查您的邮箱以激活账户",
  "data": {
    "userId": 1001,
    "username": "admin_user",
    "email": "admin@example.com",
    "createdAt": "2023-10-30T12:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 验证令牌无效)**:
```json
{
  "code": 1002,
  "message": "人机验证未通过，请重新验证",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 邮箱已存在)**:
```json
{
  "code": 1004,
  "message": "该邮箱已被注册",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.2 用户激活
**开发状态**: ✅ 已完成（`authController.activateAccount`）

用于激活新注册的用户账户。用户注册后，系统会发送包含激活令牌的邮件到用户邮箱，用户点击邮件中的链接完成激活。


*   **接口地址**: `GET /api/v1/auth/activate/{token}`
    > ⚠️ 实际请求 URL 中不要包含冒号，直接用真实 token 替换 `{token}`。
    > ✅ 也支持 `GET /api/v1/auth/activate?token=<token>` 的查询参数形式，便于复制粘贴。
*   **是否需要认证**: 否


*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| token | string | 是 | 激活令牌，从邮件中获取 |

*   **请求示例**:
```
GET /api/v1/auth/activate/f2hj3k4l5m6n7p8q9r0s1t2u3v4w5x6y7z8a9b0c1d2e3f4g5h6i7j8k9l0m1n2o3
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "账户激活成功",
  "data": {
    "userId": 1001,
    "username": "admin_user",
    "email": "admin@example.com"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 激活令牌无效或过期)**:
```json
{
  "code": 1003,
  "message": "激活链接无效或已过期",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.3 用户登录（已完成）
用于验证用户身份并签发 JWT Token。此接口与极验验证、账号激活、速率限制等机制联动，是所有受保护接口的入口。

*   **接口地址**: `POST /api/v1/auth/login`
*   **是否需要认证**: 否
*   **请求头 (Headers)**:
    *   `Content-Type: application/json`
    *   `User-Agent`: 推荐传入真实终端信息，便于风控审计
    *   `X-Forwarded-For`（可选）: 由网关填写来源 IP，便于限流/风险分析
*   **前置要求**:
    1. 账号已通过激活流程，`isActive = true`
    2. 已从 2.2 或 2.3 获取到有效的 `validate_token`
    3. 受 Express Rate Limit 保护：同一 IP 15 分钟内最多 100 次
*   **请求参数 (Body)**:


| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| account | string | 是 | 账号（支持用户名或邮箱） |
| password | string | 是 | 密码 |
| validate_token | string | 是 | 极验验证通过后返回的令牌 | 需要先完成人机验证 |

*   **请求示例**:
```json
{
  "account": "admin@example.com",
  "password": "SecurePass123!",
  "validate_token": "validation_success_token_abc123"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT Token
    "expireIn": 7200, // 过期时间（秒），例如 2 小时
    "userInfo": {
      "id": 1001,
      "username": "admin_user",
      "role": "user"
    }
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 验证令牌无效)**:
```json
{
  "code": 1002,
  "message": "人机验证未通过，请重新验证",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 账户未激活)**:
```json
{
  "code": 1003,
  "message": "账户未激活，请检查邮箱并激活账户",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 密码错误)**:
```json
{
  "code": 1002,
  "message": "账号或密码错误",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.4 邮箱验证码登录（已完成）
用于通过邮箱验证码进行登录，无需输入密码。此接口适用于用户忘记密码或希望快速登录的场景。

*   **接口地址**: `POST /api/v1/auth/login-with-code`
*   **是否需要认证**: 否
*   **请求头 (Headers)**:
    *   `Content-Type: application/json`
    *   `User-Agent`: 推荐传入真实终端信息，便于风控审计
    *   `X-Forwarded-For`（可选）: 由网关填写来源 IP，便于限流/风险分析
*   **前置要求**:
    1. 账号已通过激活流程，`isActive = true`
    2. 已从 2.2 或 2.3 获取到有效的 `validate_token`
    3. 已通过 3.6 接口获取有效的邮箱验证码
    4. 受 Express Rate Limit 保护：同一 IP 15 分钟内最多 100 次
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| email | string | 是 | 邮箱地址 |
| code | string | 是 | 邮箱验证码（6位数字） |
| validate_token | string | 是 | 极验验证通过后返回的令牌 |

*   **请求示例**:
```json
{
  "email": "admin@example.com",
  "code": "123456",
  "validate_token": "validation_success_token_abc123"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", // JWT Token
    "expireIn": 7200, // 过期时间（秒），例如 2 小时
    "userInfo": {
      "id": 1001,
      "username": "admin_user",
      "email": "admin@example.com",
      "role": "user"
    }
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 验证令牌无效)**:
```json
{
  "code": 1002,
  "message": "人机验证未通过，请重新验证",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 验证码错误或已过期)**:
```json
{
  "code": 1001,
  "message": "验证码错误或已过期",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 账户未激活)**:
```json
{
  "code": 1003,
  "message": "账户未激活，请检查邮箱并激活账户",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 用户不存在)**:
```json
{
  "code": 1005,
  "message": "用户不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.5 获取当前用户信息（已完成）
用于前端校验 Token 有效性并获取当前登录用户的基本资料。

*   **接口地址**: `GET /api/v1/user/me`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数**: 无

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1001,
    "username": "admin_user",
    "email": "admin@example.com",
    "role": "user",
    "createdAt": "2023-10-30T12:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - Token 过期)**:
```json
{
  "code": 1003,
  "message": "Token已过期，请重新登录",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.6 用户登出
**开发状态**: ✅ 已完成（`authController.logout` + 认证中间件）

*注意：由于 JWT 是无状态的，服务端通常不需要做特殊处理。此接口主要用于客户端清除 Token。*

*   **接口地址**: `POST /api/v1/auth/logout`
*   **是否需要认证**: 是（需携带有效 JWT）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **响应示例**:
```json
{
  "code": 0,
  "message": "退出登录成功",
  "data": null,
  "timestamp": 1698765432000
}
```

---


### 3.7 发送邮箱验证码
**开发状态**: ✅ 已完成（已在 `authController` 与 `routes/auth` 实现）

用于注册校验、找回密码、修改邮箱等场景。为防止刷接口，建议服务端实施频率限制（如 1 分钟一次）。


*   **接口地址**: `POST /api/v1/auth/email-code`
*   **是否需要认证**: 否（修改邮箱场景除外）
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 | 场景值 (scene) |
| :--- | :--- | :--- | :--- | :--- |
| email | string | 是 | 接收验证码的邮箱地址 | - |
| scene | string | 是 | 验证场景 | `register`, `reset_password`, `update_email` |
| validate_token | string | 是 | 极验验证通过后返回的令牌 | 需要先完成人机验证 |

*   **响应示例**:
```json
{
  "code": 0,
  "message": "验证码发送成功",
  "data": {
    "retryAfter": 60
  },
  "timestamp": 1698765432000
}
```

---

### 3.8 找回密码 (邮箱验证)
**开发状态**: ✅ 已完成（`authController.resetPassword`）

用户忘记密码时，通过邮箱验证码重置密码。


*   **接口地址**: `POST /api/v1/auth/reset-password`
*   **是否需要认证**: 否
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| email | string | 是 | 绑定的邮箱地址 |
| code | string | 是 | 收到的 6 位数字验证码 |
| newPassword | string | 是 | 新密码 |
| validate_token | string | 是 | 极验验证通过后返回的令牌 | 需要先完成人机验证 |

*   **响应示例**:
```json
{
  "code": 0,
  "message": "密码重置成功",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 3.9 更改绑定邮箱
**开发状态**: ✅ 已完成（`PATCH /user/email` 已上线）

在用户已登录状态下，更换账号绑定的邮箱地址。


*   **接口地址**: `PATCH /api/v1/user/email`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| newEmail | string | 是 | 新邮箱地址 |
| code | string | 是 | 发送到新邮箱的验证码 |
| validate_token | string | 是 | 极验验证通过后返回的令牌 | 需要先完成人机验证 |

*   **响应示例**:
```json
{
  "code": 0,
  "message": "邮箱变更成功",
  "data": null,
  "timestamp": 1698765432000
}
```

---

## 4. 管理员模块

管理员可以管理网站设置、用户信息等系统配置。

### 4.1 获取网站设置
**开发状态**: ✅ 已完成（`adminController.getSettings`）

获取当前网站的全局配置信息。

*   **接口地址**: `GET /api/v1/admin/settings`

*   **是否需要认证**: 是（需要管理员权限）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数**: 无

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "siteName": "Haoziwanymff",
    "siteTitle": "Haoziwanymff 管理系统",
    "siteDescription": "一个功能强大的二级域名分发系统",
    "siteKeywords": "二级域名,域名分发,域名管理",
    "siteAnnouncement": "欢迎使用Haoziwanymff系统",
    "siteLogo": "https://example.com/logo.png",
    "siteFavicon": "https://example.com/favicon.ico",
    "loginLogo": "https://example.com/login-logo.png",
    "adminQQ": "123456789",
    "qqGroupLink": "https://qm.qq.com/xxx",
    "registerConfig": {
      "allowRegister": true,
      "needActivation": true,
      "needCaptcha": true
    },
    "smtpConfig": {
      "host": "smtp.gmail.com",
      "port": 587,
      "secure": false,
      "user": "your-email@gmail.com",
      "from": "noreply@haoziwanymff.com"
    },
    "createdAt": "2023-10-30T12:00:00.000Z",
    "updatedAt": "2023-10-30T15:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

---

### 4.2 更新网站设置
**开发状态**: ✅ 已完成（`adminController.updateSettings`）

更新网站的全局配置信息。

*   **接口地址**: `PUT /api/v1/admin/settings`

*   **是否需要认证**: 是（需要管理员权限）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`
    *   `Content-Type: multipart/form-data`（上传文件时）

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| siteName | string | 否 | 网站名称 |
| siteTitle | string | 否 | 网站标题 |
| siteDescription | string | 否 | 网站描述 |
| siteKeywords | string | 否 | 网站关键词 |
| siteAnnouncement | string | 否 | 网站公告 |
| siteLogo | file/string | 否 | 网站Logo（支持文件上传或URL） |
| siteFavicon | file/string | 否 | 网站Favicon（支持文件上传或URL） |
| loginLogo | file/string | 否 | 登录页Logo（支持文件上传或URL） |
| adminQQ | string | 否 | 站长QQ |
| qqGroupLink | string | 否 | QQ群链接 |
| registerConfig | object | 否 | 注册配置对象 |
| smtpConfig | object | 否 | SMTP配置对象 |

**文件上传限制**:
- **支持的格式**: jpeg, jpg, png, gif, webp, ico, svg
- **文件大小**: 最大 2MB
- **上传方式**: 使用 `multipart/form-data` 格式

*   **请求示例 (JSON格式)**:
```json
{
  "siteName": "Haoziwanymff",
  "siteTitle": "Haoziwanymff 管理系统",
  "siteDescription": "一个功能强大的二级域名分发系统",
  "siteKeywords": "二级域名,域名分发,域名管理",
  "siteAnnouncement": "欢迎使用Haoziwanymff系统",
  "siteLogo": "https://example.com/logo.png",
  "siteFavicon": "https://example.com/favicon.ico",
  "loginLogo": "https://example.com/login-logo.png",
  "adminQQ": "123456789",
  "qqGroupLink": "https://qm.qq.com/xxx",
  "registerConfig": {
    "allowRegister": true,
    "needActivation": true,
    "needCaptcha": true
  },
  "smtpConfig": {
    "host": "smtp.gmail.com",
    "port": 587,
    "secure": false,
    "user": "your-email@gmail.com",
    "pass": "your-app-password",
    "from": "noreply@haoziwanymff.com"
  }
}
```

*   **请求示例 (文件上传格式)**:
```
POST /api/v1/admin/settings
Content-Type: multipart/form-data
Authorization: Bearer <token>

siteName: "Haoziwanymff"
siteTitle: "Haoziwanymff 管理系统"
siteLogo: [二进制文件]
siteFavicon: [二进制文件]
loginLogo: [二进制文件]
adminQQ: "123456789"
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "网站设置更新成功",
  "data": {
    "siteName": "Haoziwanymff",
    "siteTitle": "Haoziwanymff 管理系统",
    "siteDescription": "一个功能强大的二级域名分发系统",
    "updatedAt": "2023-10-30T15:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 权限不足)**:
```json
{
  "code": 1002,
  "message": "权限不足，仅管理员可执行此操作",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 文件格式错误)**:
```json
{
  "code": 400,
  "message": "只允许上传图片文件 (jpeg, jpg, png, gif, webp, ico, svg)",
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 文件大小超限)**:
```json
{
  "code": 400,
  "message": "文件大小超过限制，最大允许2MB",
  "timestamp": 1698765432000
}
```

---

### 4.3 测试邮件配置
测试邮件配置是否正确，发送测试邮件到指定邮箱。

*   **接口地址**: `POST /api/v1/admin/test-email`
*   **是否需要认证**: 是（需要管理员权限）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| to | string | 是 | 测试邮件接收邮箱 |
| subject | string | 否 | 邮件主题，默认为"测试邮件" |
| content | string | 否 | 邮件内容，默认为"这是一封测试邮件" |

*   **请求示例**:
```json
{
  "to": "test@example.com",
  "subject": "SMTP配置测试",
  "content": "这是一封来自Haoziwanymff系统的测试邮件，用于验证SMTP配置是否正确。"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "测试邮件发送成功",
  "data": {
    "messageId": "test-message-id-12345"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 邮件配置错误)**:
```json
{
  "code": 5000,
  "message": "邮件发送失败: SMTP配置错误",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 4.4 获取用户列表
获取系统中的所有用户信息（分页）。

*   **接口地址**: `GET /api/v1/admin/users`
*   **是否需要认证**: 是（需要管理员权限）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| keyword | string | 否 | 搜索关键词（用户名或邮箱） | - |

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": "1001",
        "username": "admin_user",
        "email": "admin@example.com",
        "isActive": true,
        "role": "admin",
        "createdAt": "2023-10-30T12:00:00.000Z"
      },
      {
        "id": "1002",
        "username": "normal_user",
        "email": "user@example.com",
        "isActive": true,
        "role": "user",
        "createdAt": "2023-10-30T12:15:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  },
  "timestamp": 1698765432000
}
```

---

### 4.5 更新用户状态
更新指定用户的状态（激活/禁用）。

*   **接口地址**: `PUT /api/v1/admin/users/:userId/status`
*   **是否需要认证**: 是（需要管理员权限）
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| userId | string | 是 | 用户ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| isActive | boolean | 是 | 是否激活 |

*   **请求示例**:
```json
{
  "isActive": false
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "用户状态更新成功",
  "data": {
    "userId": "1002",
    "isActive": false
  },
  "timestamp": 1698765432000
}
```

</file>