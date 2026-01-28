# 域名购买功能 API 文档

## 1. 模块概述

本模块提供单次域名解析的购买功能,管理员可以配置域名的价格、有效期、是否需要备案等属性,用户购买后获得该域名的使用权。支持域名使用权的购买、支付、续费等完整流程。

**核心功能**:
- 管理员配置域名属性(价格、有效期、备案要求)
- 用户浏览可用域名及配置
- 用户购买域名使用权
- 域名实名认证(待开发)
- 域名到期管理

---

## 2. 数据库表结构

详细的数据库表结构请参考: [购买下单功能数据库表设计.md](./购买下单功能数据库表设计.md)

**涉及的主要表**:
- **domains** - 域名表(已扩展,支持价格、有效期、备案等)
- **domain_orders** - 域名购买订单表
- **payment_logs** - 支付日志表
- **balance_transactions** - 余额交易记录表

---

## 3. 管理员接口

### 3.1 配置域名属性

管理员添加或更新域名时设置域名的使用属性。

*   **接口地址**: `POST /api/v1/admin/domains/configure`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domainName | string | 是 | 域名 |
| price | number | 是 | 域名使用价格(元) |
| durationDays | number | 是 | 有效期(天数) |
| requireIcp | boolean | 否 | 是否需要备案(默认false) |
| description | string | 否 | 域名描述 |

*   **请求示例**:
```json
POST /api/v1/admin/domains/configure
{
  "domainName": "example.com",
  "price": 9.90,
  "durationDays": 30,
  "requireIcp": false,
  "description": "优质域名,解析速度快"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "域名配置成功",
  "data": {
    "id": 1,
    "domainName": "example.com",
    "price": 9.90,
    "durationDays": 30,
    "requireIcp": false,
    "description": "优质域名,解析速度快",
    "createdAt": "2024-01-24T10:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 域名已存在)**:
```json
{
  "code": 1004,
  "message": "域名已存在",
  "data": null,
  "timestamp": 1698765432000
}
```

**注意事项**:
- 价格必须大于等于0
- 有效期必须大于0天
- 如果设置了requireIcp=true,用户购买后需要完成实名认证才能使用
- isVisible=false的域名不会在用户列表中显示

### 3.2 更新域名配置

修改已配置域名的属性。

*   **接口地址**: `PUT /api/v1/admin/domains/:domainId/configure`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domainId | number | 是 | 域名ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| price | number | 否 | 域名使用价格(元) |
| durationDays | number | 否 | 有效期(天数) |
| requireIcp | boolean | 否 | 是否需要备案 |
| description | string | 否 | 域名描述 |

*   **请求示例**:
```json
PUT /api/v1/admin/domains/1/configure
{
  "price": 12.90,
  "durationDays": 60,
  "requireIcp": true,
  "description": "更新后的描述"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "域名配置更新成功",
  "data": {
    "id": 1,
    "domainName": "example.com",
    "price": 12.90,
    "durationDays": 60,
    "requireIcp": true,
    "description": "更新后的描述",
    "updatedAt": "2024-01-24T10:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

### 3.3 获取域名配置列表

获取所有已配置的域名及其属性。

*   **接口地址**: `GET /api/v1/admin/domains/configure`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| isVisible | boolean | 否 | 是否向用户展示筛选 | - |

*   **请求示例**:
```
GET /api/v1/admin/domains/configure?page=1&pageSize=20
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 50,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "domainName": "example.com",
        "price": 9.90,
        "durationDays": 30,
        "requireIcp": false,
        "description": "优质域名,解析速度快",
        "isVisible": true,
        "createdAt": "2024-01-24T10:00:00.000Z",
        "updatedAt": "2024-01-24T10:00:00.000Z"
      },
      {
        "id": 2,
        "domainName": "test.com",
        "price": 19.90,
        "durationDays": 90,
        "requireIcp": true,
        "description": "需要备案的域名",
        "isVisible": true,
        "createdAt": "2024-01-24T11:00:00.000Z",
        "updatedAt": "2024-01-24T11:00:00.000Z"
      }
    ]
  },
  "timestamp": 1698765432000
}
```

### 3.4 管理用户域名订单

管理员可以查看和管理用户购买的域名订单。

*   **接口地址**: `GET /api/v1/admin/domain-orders`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| status | string | 否 | 订单状态筛选 | - |
| userId | number | 否 | 用户ID筛选 | - |

*   **请求示例**:
```
GET /api/v1/admin/domain-orders?page=1&pageSize=20&status=pending
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 100,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "orderNo": "DO202401241234567890",
        "userId": 100,
        "username": "testuser",
        "domainId": 1,
        "domainName": "example.com",
        "subdomain": "test",
        "price": 9.90,
        "durationDays": 30,
        "status": "pending",
        "paymentMethod": null,
        "paidAt": null,
        "expiresAt": "2024-01-24T11:30:00.000Z",
        "createdAt": "2024-01-24T10:00:00.000Z"
      }
    ]
  },
  "timestamp": 1698765432000
}
```

---

## 4. 用户接口

### 4.1 获取可用域名列表

用户可以浏览可购买的域名及其属性。

*   **接口地址**: `GET /api/v1/domains/available`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| sortBy | string | 否 | 排序字段(price/createdAt) | price |
| sortOrder | string | 否 | 排序方向(asc/desc) | asc |

*   **请求示例**:
```
GET /api/v1/domains/available?page=1&pageSize=20&sortBy=price&sortOrder=asc
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 30,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 1,
        "domainName": "example.com",
        "price": 9.90,
        "durationDays": 30,
        "requireIcp": false,
        "description": "优质域名,解析速度快",
        "icon": "https://cdn.example.com/icons/domain1.png",
        "features": {
          "ssl": true,
          "cdn": true,
          "speed": "high"
        }
      },
      {
        "id": 2,
        "domainName": "test.com",
        "price": 19.90,
        "durationDays": 90,
        "requireIcp": true,
        "description": "需要备案的域名",
        "icon": "https://cdn.example.com/icons/domain2.png",
        "features": {
          "ssl": true,
          "cdn": false,
          "speed": "medium"
        },
        "icpNotice": "购买此域名需要完成实名认证"
      }
    ]
  },
  "timestamp": 1698765432000
}
```

**注意事项**:
- 只返回isVisible=true的域名
- requireIcp=true的域名会显示icpNotice提示
- 可以按价格或创建时间排序

### 4.2 获取域名详情

获取指定域名的详细配置信息。

*   **接口地址**: `GET /api/v1/domains/available/:domainId`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domainId | number | 是 | 域名ID |

*   **请求示例**:
```
GET /api/v1/domains/available/1
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "domainName": "example.com",
    "price": 9.90,
    "durationDays": 30,
    "requireIcp": false,
    "description": "优质域名,解析速度快",
    "icon": "https://cdn.example.com/icons/domain1.png",
    "features": {
      "ssl": true,
      "cdn": true,
      "speed": "high",
      "dnsServers": ["ns1.example.com", "ns2.example.com"]
    },
    "rules": {
      "subdomainPattern": "^[a-z0-9-]{1,63}$",
      "targetUrlProtocol": "http/https",
      "maxRedirect": 5
    }
  },
  "timestamp": 1698765432000
}
```

**字段说明**:
- `features`: 域名特性(SSL、CDN、解析速度等)
- `rules`: 域名使用规则(二级域名格式、目标URL协议等)
- `subdomainPattern`: 二级域名的正则表达式限制
- `targetUrlProtocol`: 目标URL支持的协议
- `maxRedirect`: 最大跳转次数

### 4.3 创建域名购买订单

用户购买域名使用权,创建订单。

*   **接口地址**: `POST /api/v1/domain-orders`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domainId | number | 是 | 域名ID |
| subdomain | string | 是 | 二级域名 |
| targetUrl | string | 是 | 目标URL |

*   **请求示例**:
```json
POST /api/v1/domain-orders
{
  "domainId": 1,
  "subdomain": "test",
  "targetUrl": "https://mysite.com"
}
```

*   **响应示例 (成功 - 需要支付)**:
```json
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "orderId": 100,
    "orderNo": "DO202401241234567890",
    "domainId": 1,
    "domainName": "example.com",
    "subdomain": "test",
    "fullDomain": "test.example.com",
    "price": 9.90,
    "durationDays": 30,
    "requireIcp": false,
    "status": "pending_payment",
    "expiresAt": "2024-01-24T11:00:00.000Z",
    "createdAt": "2024-01-24T10:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 需要实名认证)**:
```json
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "orderId": 101,
    "orderNo": "DO202401241234567891",
    "domainId": 2,
    "domainName": "test.com",
    "subdomain": "myapp",
    "fullDomain": "myapp.test.com",
    "price": 19.90,
    "durationDays": 90,
    "requireIcp": true,
    "status": "pending_icp",
    "icpRequired": true,
    "icpNotice": "此域名需要完成实名认证才能使用",
    "createdAt": "2024-01-24T10:05:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 二级域名已存在)**:
```json
{
  "code": 1004,
  "message": "二级域名已存在",
  "data": {
    "existingSubdomain": "test",
    "existingDomain": "example.com"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 二级域名格式错误)**:
```json
{
  "code": 1001,
  "message": "二级域名格式不正确",
  "data": {
    "pattern": "^[a-z0-9-]{1,63}$",
    "example": "my-site-123"
  },
  "timestamp": 1698765432000
}
```

**注意事项**:
- 订单状态取决于域名是否需要备案
- requireIcp=false: status=pending_payment(待支付)
- requireIcp=true: status=pending_icp(待实名认证)
- 二级域名需要通过格式验证
- 同一个域名下的二级域名不能重复

### 4.4 支付域名订单

使用余额或第三方支付方式支付域名订单。

*   **接口地址**: `POST /api/v1/domain-orders/:orderId/pay`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| paymentMethod | string | 是 | 支付方式(balance/alipay/wechat/epay) |
| paymentType | string | 条件必填 | 支付类型(易支付必填) |

*   **请求示例 (余额支付)**:
```json
POST /api/v1/domain-orders/100/pay
{
  "paymentMethod": "balance"
}
```

*   **请求示例 (易支付-支付宝)**:
```json
POST /api/v1/domain-orders/100/pay
{
  "paymentMethod": "epay",
  "paymentType": "alipay"
}
```

*   **响应示例 (成功 - 余额支付)**:
```json
{
  "code": 0,
  "message": "支付成功",
  "data": {
    "orderId": 100,
    "orderNo": "DO202401241234567890",
    "status": "paid",
    "paymentMethod": "balance",
    "paidAt": "2024-01-24T10:30:00.000Z",
    "domainExpiresAt": "2024-02-23T10:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 第三方支付)**:
```json
{
  "code": 0,
  "message": "支付订单创建成功",
  "data": {
    "orderId": 100,
    "orderNo": "DO202401241234567890",
    "paymentMethod": "epay",
    "paymentType": "alipay",
    "amount": 9.90,
    "paymentUrl": "https://epay.example.com/submit.php?pid=xxx&...",
    "qrCode": "https://epay.example.com/qrcode.php?data=xxx",
    "expiresAt": "2024-01-24T11:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 余额不足)**:
```json
{
  "code": 1006,
  "message": "余额不足",
  "data": {
    "currentBalance": 5.00,
    "requiredAmount": 9.90,
    "shortfall": 4.90
  },
  "timestamp": 1698765432000
}
```

### 4.5 获取我的域名订单

获取用户自己的域名购买订单列表。

*   **接口地址**: `GET /api/v1/domain-orders`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| status | string | 否 | 订单状态筛选 | - |

*   **请求示例**:
```
GET /api/v1/domain-orders?page=1&pageSize=20&status=paid
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 10,
    "page": 1,
    "pageSize": 20,
    "list": [
      {
        "id": 100,
        "orderNo": "DO202401241234567890",
        "domainId": 1,
        "domainName": "example.com",
        "subdomain": "test",
        "fullDomain": "test.example.com",
        "price": 9.90,
        "durationDays": 30,
        "status": "paid",
        "paymentMethod": "alipay",
        "paidAt": "2024-01-24T10:30:00.000Z",
        "domainExpiresAt": "2024-02-23T10:30:00.000Z",
        "isExpired": false,
        "createdAt": "2024-01-24T10:00:00.000Z"
      },
      {
        "id": 99,
        "orderNo": "DO202401241234567889",
        "domainId": 2,
        "domainName": "test.com",
        "subdomain": "myapp",
        "fullDomain": "myapp.test.com",
        "price": 19.90,
        "durationDays": 90,
        "status": "expired",
        "paymentMethod": "wechat",
        "paidAt": "2024-01-10T10:00:00.000Z",
        "domainExpiresAt": "2024-01-10T10:00:00.000Z",
        "isExpired": true,
        "createdAt": "2024-01-10T09:00:00.000Z"
      }
    ]
  },
  "timestamp": 1698765432000
}
```

### 4.6 获取域名订单详情

获取指定订单的详细信息。

*   **接口地址**: `GET /api/v1/domain-orders/:orderId`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
GET /api/v1/domain-orders/100
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 100,
    "orderNo": "DO202401241234567890",
    "userId": 100,
    "domainId": 1,
    "domainName": "example.com",
    "subdomain": "test",
    "fullDomain": "test.example.com",
    "targetUrl": "https://mysite.com",
    "price": 9.90,
    "durationDays": 30,
    "status": "paid",
    "paymentMethod": "alipay",
    "transactionId": "202401242200000123456789012345678",
    "paidAt": "2024-01-24T10:30:00.000Z",
    "domainExpiresAt": "2024-02-23T10:30:00.000Z",
    "daysRemaining": 30,
    "isExpired": false,
    "requireIcp": false,
    "icpVerified": true,
    "createdAt": "2024-01-24T10:00:00.000Z",
    "updatedAt": "2024-01-24T10:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

### 4.7 取消域名订单

取消待支付的域名订单。

*   **接口地址**: `DELETE /api/v1/domain-orders/:orderId`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
DELETE /api/v1/domain-orders/100
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "订单已取消",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单已支付)**:
```json
{
  "code": 1007,
  "message": "订单已支付,无法取消",
  "data": null,
  "timestamp": 1698765432000
}
```

**注意事项**:
- 只有pending状态的订单可以取消
- 已支付或已过期的订单不能取消

---

## 5. 支付回调接口

### 5.1 支付宝回调

*   **接口地址**: `POST /api/v1/payments/callback/alipay`
*   **是否需要认证**: 否
*   **请求格式**: application/x-www-form-urlencoded

*   **回调参数**: 支付宝标准回调参数

*   **响应格式**: "success"

### 5.2 微信支付回调

*   **接口地址**: `POST /api/v1/payments/callback/wechat`
*   **是否需要认证**: 否
*   **请求格式**: application/xml

*   **回调参数**: 微信支付标准回调参数

*   **响应格式**: XML (SUCCESS)

### 5.3 易支付回调

*   **接口地址**: `POST /api/v1/payments/callback/epay`
*   **是否需要认证**: 否
*   **请求格式**: application/x-www-form-urlencoded

*   **回调参数**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| pid | string | 是 | 商户ID |
| trade_no | string | 是 | 易支付交易号 |
| out_trade_no | string | 是 | 商户订单号 |
| type | string | 是 | 支付类型 |
| name | string | 是 | 商品名称 |
| money | string | 是 | 支付金额 |
| trade_status | string | 是 | 交易状态(TRADE_SUCCESS/TRADE_PENDING) |
| time | string | 是 | 支付时间 |
| sign | string | 是 | 签名 |

*   **响应格式**: "success"

---

## 6. 业务流程说明

### 6.1 域名购买流程

```
1. 用户浏览可用域名列表
   GET /api/v1/domains/available

2. 用户选择域名,查看详情
   GET /api/v1/domains/available/:domainId

3. 用户创建订单
   POST /api/v1/domain-orders
   { domainId, subdomain, targetUrl }
   
   → 如果requireIcp=true, 订单状态为pending_icp
   → 如果requireIcp=false, 订单状态为pending_payment

4. 用户支付订单
   POST /api/v1/domain-orders/:orderId/pay
   { paymentMethod, paymentType }
   
   → 余额支付: 直接扣减余额,订单状态改为paid
   → 第三方支付: 返回支付URL,用户完成支付后状态改为paid

5. 支付成功后系统自动:
   - 更新订单状态为paid
   - 记录支付日志
   - 如果使用余额支付,记录余额交易
   - 创建/更新domains表中的域名记录
   - 设置域名的到期时间(paidAt + durationDays)
   - 如果requireIcp=true,设置域名为pending_icp状态
```

### 6.2 域名到期处理

```
定时任务每小时执行:

1. 查询即将到期的域名(7天内到期)
   SELECT * FROM domains 
   WHERE expires_at BETWEEN NOW() AND DATE_ADD(NOW(), INTERVAL 7 DAY)
   → 发送到期提醒邮件

2. 查询已到期的域名
   SELECT * FROM domains 
   WHERE expires_at < NOW() AND status = 'active'
   → 更新状态为inactive
   → 停止DNS解析
   → 发送到期通知
```

---

## 7. 实名认证(待开发)

### 7.1 提交实名认证信息

用户提交实名认证信息(身份证、姓名等)。

*   **接口地址**: `POST /api/v1/icp/submit`
*   **是否需要认证**: 是
*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| realName | string | 是 | 真实姓名 |
| idCard | string | 是 | 身份证号 |
| phone | string | 是 | 手机号 |

**注意**: 此功能待后续开发

---

## 8. 错误码说明

| 错误码 | 描述 |
| :--- | :--- |
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | Token过期或无效 |
| 1004 | 资源已存在 |
| 1005 | 资源不存在 |
| 1006 | 余额不足 |
| 1007 | 订单已支付,无法取消 |
| 1008 | 二级域名格式错误 |
| 1009 | 域名需要实名认证 |
| 5000 | 服务器内部错误 |

---

**文档版本**: V1.0
**创建日期**: 2024-01-24
**维护人员**: 开发团队
