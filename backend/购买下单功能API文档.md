# 用户购买下单功能 API 文档

## 1. 模块概述

本模块提供完整的用户购买下单功能,包括产品套餐管理、订单创建、支付处理、订单查询等核心功能。用户可以通过购买不同套餐获得相应的二级域名使用权益。

## 2. 数据库表结构

详细的数据库表结构设计请参考: [购买下单功能数据库表设计.md](./购买下单功能数据库表设计.md)

本模块包含以下6张核心表:
- **products** - 产品套餐表
- **orders** - 订单表
- **user_subscriptions** - 用户订阅表
- **payment_logs** - 支付日志表
- **user_balance** - 用户余额表
- **balance_transactions** - 余额交易记录表

---

## 3. 产品套餐管理

### 3.1 获取产品套餐列表

获取系统中可用的产品套餐列表。

*   **接口地址**: `GET /api/v1/products`
*   **是否需要认证**: 否
*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| isActive | boolean | 否 | 是否启用筛选 | - |
| sortBy | string | 否 | 排序字段 | sort_order |
| sortOrder | string | 否 | 排序方向(asc/desc) | asc |

*   **请求示例**:
```
GET /api/v1/products?isActive=true&sortBy=sort_order&sortOrder=asc
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "免费版",
        "description": "适合个人用户使用,包含基础功能",
        "price": 0.00,
        "originalPrice": 0.00,
        "durationDays": 30,
        "maxDomains": 1,
        "maxSubdomains": 5,
        "features": {
          "custom_dns": false,
          "ssl_certificate": false,
          "api_access": false,
          "priority_support": false
        },
        "isActive": true,
        "sortOrder": 0,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 2,
        "name": "基础版",
        "description": "适合小型团队,提供更多功能和资源",
        "price": 29.90,
        "originalPrice": 59.90,
        "durationDays": 30,
        "maxDomains": 5,
        "maxSubdomains": 50,
        "features": {
          "custom_dns": true,
          "ssl_certificate": false,
          "api_access": true,
          "priority_support": false
        },
        "isActive": true,
        "sortOrder": 1,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "id": 3,
        "name": "专业版",
        "description": "适合企业用户,提供完整功能和优先支持",
        "price": 99.90,
        "originalPrice": 199.90,
        "durationDays": 30,
        "maxDomains": 20,
        "maxSubdomains": 200,
        "features": {
          "custom_dns": true,
          "ssl_certificate": true,
          "api_access": true,
          "priority_support": true
        },
        "isActive": true,
        "sortOrder": 2,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 3
  },
  "timestamp": 1698765432000
}
```

---

### 3.2 获取产品套餐详情

获取指定产品套餐的详细信息。

*   **接口地址**: `GET /api/v1/products/:productId`
*   **是否需要认证**: 否
*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| productId | number | 是 | 产品ID |

*   **请求示例**:
```
GET /api/v1/products/2
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 2,
    "name": "基础版",
    "description": "适合小型团队,提供更多功能和资源",
    "price": 29.90,
    "originalPrice": 59.90,
    "durationDays": 30,
    "maxDomains": 5,
    "maxSubdomains": 50,
    "features": {
      "custom_dns": true,
      "ssl_certificate": false,
      "api_access": true,
      "priority_support": false
    },
    "isActive": true,
    "sortOrder": 1,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 产品不存在)**:
```json
{
  "code": 1005,
  "message": "产品不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

---

## 4. 订单管理

### 4.1 创建订单

用户购买产品套餐时创建订单。

*   **接口地址**: `POST /api/v1/orders`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| productId | number | 是 | 产品ID |
| remark | string | 否 | 订单备注 |

*   **请求示例**:
```json
{
  "productId": 2,
  "remark": "购买基础版套餐"
}
```

**注意事项**:
- 创建订单后,订单状态为 `pending`(待支付)
- 订单会在30分钟后自动过期
- 用户需要支付后才能激活套餐

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "订单创建成功",
  "data": {
    "id": 10001,
    "orderNo": "202401241234567890",
    "userId": 1001,
    "productId": 2,
    "productName": "基础版",
    "price": 29.90,
    "discountAmount": 0.00,
    "finalAmount": 29.90,
    "status": "pending",
    "paymentMethod": null,
    "paymentTime": null,
    "transactionId": null,
    "expiresAt": "2024-01-24T13:00:00.000Z",
    "remark": "购买基础版套餐",
    "createdAt": "2024-01-24T12:30:00.000Z",
    "updatedAt": "2024-01-24T12:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 产品不存在)**:
```json
{
  "code": 1005,
  "message": "产品不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 用户已有未过期订单)**:
```json
{
  "code": 1001,
  "message": "您有未完成支付的订单,请先完成支付",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 4.2 获取订单列表

获取当前用户的订单列表。

*   **接口地址**: `GET /api/v1/orders`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| status | string | 否 | 订单状态筛选 | - |

*   **请求示例**:
```
GET /api/v1/orders?page=1&pageSize=10&status=paid
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "orderNo": "202401241234567890",
        "productName": "基础版",
        "price": 29.90,
        "discountAmount": 0.00,
        "finalAmount": 29.90,
        "status": "paid",
        "paymentMethod": "alipay",
        "paymentTime": "2024-01-24T12:35:00.000Z",
        "transactionId": "2024012422001425611234567890",
        "createdAt": "2024-01-24T12:30:00.000Z",
        "expiresAt": "2024-01-24T13:00:00.000Z"
      },
      {
        "id": 10002,
        "orderNo": "202401249876543210",
        "productName": "专业版",
        "price": 99.90,
        "discountAmount": 0.00,
        "finalAmount": 99.90,
        "status": "pending",
        "paymentMethod": null,
        "paymentTime": null,
        "transactionId": null,
        "createdAt": "2024-01-24T13:00:00.000Z",
        "expiresAt": "2024-01-24T13:30:00.000Z"
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

### 4.3 获取订单详情

获取指定订单的详细信息。

*   **接口地址**: `GET /api/v1/orders/:orderId`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
GET /api/v1/orders/10001
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 10001,
    "orderNo": "202401241234567890",
    "userId": 1001,
    "productId": 2,
    "productName": "基础版",
    "price": 29.90,
    "discountAmount": 0.00,
    "finalAmount": 29.90,
    "status": "paid",
    "paymentMethod": "alipay",
    "paymentTime": "2024-01-24T12:35:00.000Z",
    "transactionId": "2024012422001425611234567890",
    "expiresAt": "2024-01-24T13:00:00.000Z",
    "remark": "购买基础版套餐",
    "product": {
      "id": 2,
      "name": "基础版",
      "description": "适合小型团队,提供更多功能和资源",
      "durationDays": 30,
      "maxDomains": 5,
      "maxSubdomains": 50,
      "features": {
        "custom_dns": true,
        "ssl_certificate": false,
        "api_access": true,
        "priority_support": false
      }
    },
    "createdAt": "2024-01-24T12:30:00.000Z",
    "updatedAt": "2024-01-24T12:35:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 无权访问)**:
```json
{
  "code": 1002,
  "message": "无权访问该订单",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 4.4 取消订单

取消未支付的订单。

*   **接口地址**: `POST /api/v1/orders/:orderId/cancel`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
POST /api/v1/orders/10002/cancel
```

**注意事项**:
- 只能取消状态为 `pending`(待支付) 的订单
- 已支付的订单无法取消

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "订单取消成功",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单已支付)**:
```json
{
  "code": 1001,
  "message": "已支付的订单无法取消",
  "data": null,
  "timestamp": 1698765432000
}
```

---

## 5. 支付管理

### 5.1 余额支付

使用账户余额支付订单。

*   **接口地址**: `POST /api/v1/orders/:orderId/pay/balance`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
POST /api/v1/orders/10001/pay/balance
```

**注意事项**:
- 余额必须大于等于订单金额
- 只有 `pending`(待支付) 状态的订单可以支付
- 支付成功后订单状态变为 `paid`(已支付),并自动激活用户套餐

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "支付成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "paymentMethod": "balance",
    "paymentTime": "2024-01-24T12:35:00.000Z",
    "subscription": {
      "id": 1,
      "userId": 1001,
      "productName": "基础版",
      "startDate": "2024-01-24T12:35:00.000Z",
      "endDate": "2024-02-23T12:35:00.000Z",
      "maxDomains": 5,
      "maxSubdomains": 50,
      "usedDomains": 0,
      "usedSubdomains": 0
    }
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 余额不足)**:
```json
{
  "code": 1001,
  "message": "余额不足,当前余额: 10.00, 需要支付: 29.90",
  "data": {
    "currentBalance": 10.00,
    "requiredAmount": 29.90
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单已支付)**:
```json
{
  "code": 1001,
  "message": "订单已支付,无需重复支付",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 5.2 支付宝支付

创建支付宝支付订单。

*   **接口地址**: `POST /api/v1/orders/:orderId/pay/alipay`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
POST /api/v1/orders/10001/pay/alipay
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "支付宝支付订单创建成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "paymentUrl": "https://openapi.alipay.com/gateway.do?...",
    "qrCode": "https://qr.alipay.com/xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 5.3 微信支付

创建微信支付订单。

*   **接口地址**: `POST /api/v1/orders/:orderId/pay/wechat`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
POST /api/v1/orders/10001/pay/wechat
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "微信支付订单创建成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "codeUrl": "weixin://wxpay/bizpayurl?pr=xxx",
    "qrCode": "https://api.weixin.qq.com/xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 5.4 易支付(聚合支付)

易支付是一个第三方聚合支付平台,支持支付宝、微信支付等多种支付方式。

*   **接口地址**: `POST /api/v1/orders/:orderId/pay/epay`
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
| type | string | 是 | 支付类型(alipay/wechat/qqpay) |

*   **请求示例 (支付宝)**:
```json
POST /api/v1/orders/10001/pay/epay
{
  "type": "alipay"
}
```

*   **请求示例 (微信)**:
```json
POST /api/v1/orders/10001/pay/epay
{
  "type": "wechat"
}
```

**注意事项**:
- 易支付支持支付宝(alipay)、微信(wechat)、QQ支付(qqpay)
- 返回的支付链接可直接跳转支付,也可生成二维码供扫码支付
- 支付类型必须与易支付商户支持的支付方式一致

*   **响应示例 (成功 - 支付宝)**:
```json
{
  "code": 0,
  "message": "易支付订单创建成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "paymentMethod": "epay",
    "paymentType": "alipay",
    "paymentUrl": "https://epay.example.com/submit.php?pid=xxx&key=xxx&out_trade_no=202401241234567890&money=29.90&...",
    "qrCode": "https://epay.example.com/qrcode.php?data=xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 微信)**:
```json
{
  "code": 0,
  "message": "易支付订单创建成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "paymentMethod": "epay",
    "paymentType": "wechat",
    "paymentUrl": "https://epay.example.com/submit.php?pid=xxx&key=xxx&out_trade_no=202401241234567890&money=29.90&...",
    "qrCode": "https://epay.example.com/qrcode.php?data=xxx",
    "codeUrl": "weixin://wxpay/bizpayurl?pr=xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 不支持的支付类型)**:
```json
{
  "code": 1001,
  "message": "不支持的支付类型",
  "data": {
    "supportedTypes": ["alipay", "wechat", "qqpay"]
  },
  "timestamp": 1698765432000
}
```

---

### 5.5 易支付查询订单

查询易支付订单的支付状态。

*   **接口地址**: `GET /api/v1/orders/:orderId/epay/query`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求示例**:
```
GET /api/v1/orders/10001/epay/query
```

*   **响应示例 (成功 - 已支付)**:
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "tradeNo": "EPAY202401241234567890123",
    "tradeStatus": "TRADE_SUCCESS",
    "tradeStatusText": "支付成功",
    "totalFee": "29.90",
    "tradeTime": "2024-01-24T12:35:00.000Z",
    "buyerEmail": "buyer@example.com",
    "notifyTime": "2024-01-24T12:35:05.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 未支付)**:
```json
{
  "code": 0,
  "message": "查询成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "tradeNo": "",
    "tradeStatus": "TRADE_PENDING",
    "tradeStatusText": "未支付",
    "totalFee": "29.90",
    "tradeTime": "",
    "buyerEmail": "",
    "notifyTime": ""
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 订单不存在)**:
```json
{
  "code": 1005,
  "message": "订单不存在",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 5.6 支付回调通知

第三方支付平台回调接口,用于接收支付结果通知。

*   **接口地址**: `POST /api/v1/payments/callback/{payment_method}`
*   **是否需要认证**: 否 (由第三方支付平台调用)
*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| payment_method | string | 是 | 支付方式 (alipay/wechat) |

*   **请求示例 (支付宝)**:
```
POST /api/v1/payments/callback/alipay
Content-Type: application/x-www-form-urlencoded

out_trade_no=202401241234567890&trade_no=2024012422001425611234567890&trade_status=TRADE_SUCCESS&total_amount=29.90
```

*   **响应示例 (成功 - 支付宝)**:
```
success
```

*   **响应示例 (成功 - 微信)**:
```json
{
  "code": "SUCCESS",
  "message": "成功"
}
```

*   **请求示例 (易支付)**:
```
POST /api/v1/payments/callback/epay
Content-Type: application/x-www-form-urlencoded

pid=1000&trade_no=EPAY202401241234567890123&out_trade_no=202401241234567890&type=alipay&name=基础版套餐&money=29.90&trade_status=TRADE_SUCCESS&time=2024-01-24+12%3A35%3A00
```

*   **响应示例 (成功 - 易支付)**:
```
success
```

*   **响应示例 (失败 - 重复通知)**:
```
fail
```

**注意事项**:
- 此接口由第三方支付平台主动调用
- 需要验证签名确保请求来自合法的支付平台
- 支付成功后会自动更新订单状态并激活用户套餐

---

## 6. 余额管理

### 6.1 获取用户余额

获取当前用户的账户余额信息。

*   **接口地址**: `GET /api/v1/user/balance`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "balance": 100.50,
    "totalRecharge": 500.00,
    "totalConsumed": 399.50
  },
  "timestamp": 1698765432000
}
```

---

### 6.2 获取余额交易记录

获取当前用户的余额交易记录。

*   **接口地址**: `GET /api/v1/user/balance/transactions`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| type | string | 否 | 交易类型筛选 | - |

*   **请求示例**:
```
GET /api/v1/user/balance/transactions?page=1&pageSize=20&type=recharge
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "userId": 1001,
        "type": "recharge",
        "amount": 100.00,
        "balanceBefore": 0.50,
        "balanceAfter": 100.50,
        "description": "在线充值",
        "relatedOrderId": null,
        "createdAt": "2024-01-24T10:00:00.000Z"
      },
      {
        "id": 2,
        "userId": 1001,
        "type": "consume",
        "amount": -29.90,
        "balanceBefore": 100.50,
        "balanceAfter": 70.60,
        "description": "购买基础版套餐",
        "relatedOrderId": 10001,
        "createdAt": "2024-01-24T12:35:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1698765432000
}
```

---

### 6.3 余额充值

使用支付宝、微信或易支付充值余额。

*   **接口地址**: `POST /api/v1/user/balance/recharge`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| amount | number | 是 | 充值金额(最小10元) |
| paymentMethod | string | 是 | 支付方式(alipay/wechat/epay) |
| paymentType | string | 条件必填 | 支付类型(易支付必填,alipay/wechat/qqpay) |

*   **请求示例 (支付宝)**:
```json
{
  "amount": 100.00,
  "paymentMethod": "alipay"
}
```

*   **请求示例 (易支付)**:
```json
{
  "amount": 100.00,
  "paymentMethod": "epay",
  "paymentType": "alipay"
}
```

**注意事项**:
- 充值金额不能小于10元
- 充值成功后金额会立即到账

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "充值订单创建成功",
  "data": {
    "rechargeOrderId": "RC202401241234567890",
    "amount": 100.00,
    "paymentMethod": "alipay",
    "paymentUrl": "https://openapi.alipay.com/gateway.do?...",
    "qrCode": "https://qr.alipay.com/xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 易支付)**:
```json
{
  "code": 0,
  "message": "充值订单创建成功",
  "data": {
    "rechargeOrderId": "RC202401241234567890",
    "amount": 100.00,
    "paymentMethod": "epay",
    "paymentType": "alipay",
    "paymentUrl": "https://epay.example.com/submit.php?pid=xxx&key=xxx&...",
    "qrCode": "https://epay.example.com/qrcode.php?data=xxx",
    "expiresAt": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 金额不足)**:
```json
{
  "code": 1001,
  "message": "充值金额不能小于10元",
  "data": null,
  "timestamp": 1698765432000
}
```

---

## 7. 用户订阅管理

### 7.1 获取用户订阅信息

获取当前用户的套餐订阅信息。

*   **接口地址**: `GET /api/v1/user/subscription`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **响应示例 (成功 - 有订阅)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "id": 1,
    "userId": 1001,
    "productId": 2,
    "productName": "基础版",
    "startDate": "2024-01-24T12:35:00.000Z",
    "endDate": "2024-02-23T12:35:00.000Z",
    "maxDomains": 5,
    "maxSubdomains": 50,
    "usedDomains": 2,
    "usedSubdomains": 15,
    "features": {
      "custom_dns": true,
      "ssl_certificate": false,
      "api_access": true,
      "priority_support": false
    },
    "isActive": true,
    "daysRemaining": 30,
    "createdAt": "2024-01-24T12:35:00.000Z",
    "updatedAt": "2024-01-24T12:35:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (成功 - 无订阅)**:
```json
{
  "code": 0,
  "message": "success",
  "data": null,
  "timestamp": 1698765432000
}
```

---

### 7.2 检查用户资源使用情况

检查当前用户的域名和二级域名使用情况。

*   **接口地址**: `GET /api/v1/user/subscription/usage`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "maxDomains": 5,
    "usedDomains": 2,
    "availableDomains": 3,
    "maxSubdomains": 50,
    "usedSubdomains": 15,
    "availableSubdomains": 35,
    "isExceeded": false,
    "subscriptionStatus": {
      "isActive": true,
      "endDate": "2024-02-23T12:35:00.000Z",
      "daysRemaining": 30
    }
  },
  "timestamp": 1698765432000
}
```

---

## 8. 管理员接口

### 8.1 获取订单列表(管理员)

管理员获取所有订单列表,支持多条件筛选。

*   **接口地址**: `GET /api/v1/admin/orders`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| status | string | 否 | 订单状态筛选 | - |
| userId | number | 否 | 用户ID筛选 | - |
| orderNo | string | 否 | 订单号搜索 | - |
| startDate | string | 否 | 开始日期(YYYY-MM-DD) | - |
| endDate | string | 否 | 结束日期(YYYY-MM-DD) | - |

*   **请求示例**:
```
GET /api/v1/admin/orders?page=1&pageSize=20&status=paid&startDate=2024-01-01&endDate=2024-01-31
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 10001,
        "orderNo": "202401241234567890",
        "userId": 1001,
        "username": "testuser",
        "email": "test@example.com",
        "productId": 2,
        "productName": "基础版",
        "price": 29.90,
        "discountAmount": 0.00,
        "finalAmount": 29.90,
        "status": "paid",
        "paymentMethod": "alipay",
        "paymentTime": "2024-01-24T12:35:00.000Z",
        "transactionId": "2024012422001425611234567890",
        "createdAt": "2024-01-24T12:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1698765432000
}
```

---

### 8.2 手动完成订单

管理员可以手动完成订单(例如用于线下支付等特殊情况)。

*   **接口地址**: `POST /api/v1/admin/orders/:orderId/complete`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| paymentMethod | string | 是 | 支付方式(balance/offline/other) |
| remark | string | 否 | 备注说明 |

*   **请求示例**:
```json
{
  "paymentMethod": "offline",
  "remark": "银行转账支付"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "订单完成成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "status": "paid",
    "paymentMethod": "offline",
    "paymentTime": "2024-01-24T12:40:00.000Z"
  },
  "timestamp": 1698765432000
}
```

---

### 8.3 退款处理

管理员处理订单退款。

*   **接口地址**: `POST /api/v1/admin/orders/:orderId/refund`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| orderId | number | 是 | 订单ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| refundAmount | number | 是 | 退款金额 |
| refundMethod | string | 是 | 退款方式(original/balance) |
| reason | string | 是 | 退款原因 |

*   **请求示例**:
```json
{
  "refundAmount": 29.90,
  "refundMethod": "balance",
  "reason": "用户申请退款"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "退款处理成功",
  "data": {
    "orderId": 10001,
    "orderNo": "202401241234567890",
    "refundAmount": 29.90,
    "refundMethod": "balance",
    "refundStatus": "processed",
    "refundTime": "2024-01-24T13:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

---

### 8.4 获取产品列表(管理员)

管理员获取所有产品套餐列表,包括已禁用的产品。

*   **接口地址**: `GET /api/v1/admin/products`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **查询参数 (Query)**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
| :--- | :--- | :--- | :--- | :--- |
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| isActive | boolean | 否 | 是否启用筛选 | - |

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "免费版",
        "price": 0.00,
        "durationDays": 30,
        "maxDomains": 1,
        "maxSubdomains": 5,
        "isActive": true,
        "sortOrder": 0,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  },
  "timestamp": 1698765432000
}
```

---

### 8.5 创建产品套餐

管理员创建新的产品套餐。

*   **接口地址**: `POST /api/v1/admin/products`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| name | string | 是 | 产品名称 |
| description | string | 否 | 产品描述 |
| price | number | 是 | 产品价格 |
| originalPrice | number | 否 | 原价 |
| durationDays | number | 是 | 有效期(天数) |
| maxDomains | number | 是 | 最大域名数量 |
| maxSubdomains | number | 是 | 最大二级域名数量 |
| features | object | 否 | 功能特性(JSON对象) |
| isActive | boolean | 否 | 是否启用,默认true |
| sortOrder | number | 否 | 排序顺序,默认0 |

*   **请求示例**:
```json
{
  "name": "企业版",
  "description": "适合大型企业,提供完整功能和企业级支持",
  "price": 299.90,
  "originalPrice": 599.90,
  "durationDays": 30,
  "maxDomains": 50,
  "maxSubdomains": 1000,
  "features": {
    "custom_dns": true,
    "ssl_certificate": true,
    "api_access": true,
    "priority_support": true,
    "dedicated_support": true
  },
  "isActive": true,
  "sortOrder": 3
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "产品创建成功",
  "data": {
    "id": 4,
    "name": "企业版",
    "description": "适合大型企业,提供完整功能和企业级支持",
    "price": 299.90,
    "originalPrice": 599.90,
    "durationDays": 30,
    "maxDomains": 50,
    "maxSubdomains": 1000,
    "features": {
      "custom_dns": true,
      "ssl_certificate": true,
      "api_access": true,
      "priority_support": true,
      "dedicated_support": true
    },
    "isActive": true,
    "sortOrder": 3,
    "createdAt": "2024-01-24T14:00:00.000Z",
    "updatedAt": "2024-01-24T14:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

---

### 8.6 更新产品套餐

管理员更新产品套餐信息。

*   **接口地址**: `PUT /api/v1/admin/products/:productId`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| productId | number | 是 | 产品ID |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| name | string | 否 | 产品名称 |
| description | string | 否 | 产品描述 |
| price | number | 否 | 产品价格 |
| originalPrice | number | 否 | 原价 |
| durationDays | number | 否 | 有效期(天数) |
| maxDomains | number | 否 | 最大域名数量 |
| maxSubdomains | number | 否 | 最大二级域名数量 |
| features | object | 否 | 功能特性(JSON对象) |
| isActive | boolean | 否 | 是否启用 |
| sortOrder | number | 否 | 排序顺序 |

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "产品更新成功",
  "data": {
    "id": 4,
    "name": "企业版",
    "price": 299.90,
    "updatedAt": "2024-01-24T14:30:00.000Z"
  },
  "timestamp": 1698765432000
}
```

---

### 8.7 删除产品套餐

管理员删除产品套餐。

*   **接口地址**: `DELETE /api/v1/admin/products/:productId`
*   **是否需要认证**: 是(需要管理员权限)
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| productId | number | 是 | 产品ID |

**注意事项**:
- 如果该产品已被用户订阅,则不允许删除
- 需要先禁用产品,等待所有订阅到期后再删除

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "产品删除成功",
  "data": null,
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 产品正在使用中)**:
```json
{
  "code": 1001,
  "message": "该产品正在被用户使用,无法删除",
  "data": null,
  "timestamp": 1698765432000
}
```

---

## 9. 错误码说明

| 错误码 | 描述 |
| :--- | :--- |
| 0 | Success |
| 1001 | 参数错误 |
| 1002 | 未授权/权限不足 |
| 1003 | Token过期或无效 |
| 1004 | 资源已存在 |
| 1005 | 资源不存在 |
| 2001 | 订单状态错误 |
| 2002 | 余额不足 |
| 2003 | 产品已下架 |
| 2004 | 订单已过期 |
| 2005 | 资源配额不足 |
| 3001 | 支付失败 |
| 3002 | 支付金额不匹配 |
| 3003 | 退款失败 |
| 5000 | 服务器内部错误 |

---

## 10. 业务流程说明

### 10.1 购买套餐流程

```
用户浏览产品 → 选择套餐 → 创建订单 → 选择支付方式 → 完成支付 → 激活订阅
```

**详细步骤**:
1. 用户通过 `GET /api/v1/products` 获取产品列表
2. 用户通过 `GET /api/v1/products/:productId` 查看产品详情
3. 用户通过 `POST /api/v1/orders` 创建订单
4. 用户选择支付方式:
   - 余额支付: `POST /api/v1/orders/:orderId/pay/balance`
   - 支付宝: `POST /api/v1/orders/:orderId/pay/alipay`
   - 微信: `POST /api/v1/orders/:orderId/pay/wechat`
   - 易支付: `POST /api/v1/orders/:orderId/pay/epay` (支持支付宝/微信/QQ支付)
5. 第三方支付平台通过 `POST /api/v1/payments/callback/{payment_method}` 回调通知
6. 系统自动激活用户订阅,更新 `user_subscriptions` 表

---

### 10.2 余额充值流程

```
用户发起充值 → 选择支付方式 → 完成支付 → 余额到账 → 记录交易流水
```

**详细步骤**:
1. 用户通过 `GET /api/v1/user/balance` 查看当前余额
2. 用户通过 `POST /api/v1/user/balance/recharge` 创建充值订单
3. 用户完成支付
4. 系统更新 `user_balance` 表,增加余额
5. 系统在 `balance_transactions` 表中记录交易流水

---

### 10.3 退款流程

```
用户申请退款 → 管理员审核 → 处理退款 → 更新订单状态 → 恢复资源配额
```

**详细步骤**:
1. 用户联系客服申请退款
2. 管理员通过 `GET /api/v1/admin/orders` 查看订单详情
3. 管理员通过 `POST /api/v1/admin/orders/:orderId/refund` 处理退款
4. 系统更新 `orders` 表,状态改为 `refunded`
5. 系统根据退款方式处理资金返还
6. 系统在 `payment_logs` 表中记录退款信息

---

## 11. 定时任务

### 11.1 订单过期检查

**执行频率**: 每5分钟

**功能描述**: 检查所有状态为 `pending` 的订单,如果超过30分钟未支付,自动将订单状态更新为 `expired`。

### 11.2 订阅到期检查

**执行频率**: 每小时

**功能描述**: 检查所有到期的订阅,将 `is_active` 字段设置为 `false`,发送到期提醒邮件。

### 11.3 清理过期支付日志

**执行频率**: 每天凌晨2点

**功能描述**: 删除30天前的支付日志记录,释放数据库空间。

---

## 12. 安全注意事项

### 12.1 支付安全
- 支付回调接口必须验证签名,确保请求来自合法的支付平台
- 支付金额需要与订单金额严格匹配,防止金额篡改
- 支付成功后需要幂等处理,防止重复回调导致重复充值

### 12.2 订单安全
- 订单号需要具有唯一性,建议使用 `时间戳 + 随机数` 生成
- 订单过期后才能重新创建相同产品的订单
- 订单金额只能由系统内部计算,不允许前端传入

### 12.3 资源安全
- 用户购买套餐后,系统需要严格限制域名和二级域名数量
- 套餐到期后,需要禁用相关域名的访问权限
- 退款后,需要扣除相应的资源配额

### 12.4 数据安全
- 用户余额、订单金额等敏感数据必须精确计算,使用 DECIMAL 类型
- 支付日志、交易流水等数据需要永久保存,用于审计和对账
- 定期备份数据库,防止数据丢失

---

## 13. 最佳实践建议

### 13.1 性能优化
1. 为高频查询的字段建立索引(order_no, user_id, status等)
2. 使用Redis缓存产品列表等不常变化的数据
3. 订单列表查询使用分页,避免一次性加载大量数据

### 13.2 用户体验
1. 订单创建后提供倒计时,提示用户订单即将过期
2. 支付成功后立即跳转到订阅页面,让用户看到权益
3. 套餐到期前7天发送邮件提醒用户续费

### 13.3 数据统计
1. 记录每日、每周、每月的订单数量和金额
2. 统计各套餐的销售情况和转化率
3. 分析用户流失率,优化产品定价

### 13.4 异常处理
1. 支付失败后提供明确的错误提示和解决方案
2. 订单长时间未支付发送提醒邮件
3. 系统异常时记录详细日志,便于排查问题

---

## 14. 附录

### 14.1 支付平台对接

#### 支付宝对接
- 申请支付宝开放平台账号
- 创建应用并获取 AppID、应用私钥、支付宝公钥
- 配置异步通知地址和同步跳转地址
- 参考文档: https://opendocs.alipay.com/open/204

#### 微信支付对接
- 申请微信商户号
- 获取商户号、API密钥、API证书
- 配置支付回调地址
- 参考文档: https://pay.weixin.qq.com/wiki/doc/api/index.html

### 14.2 数据库初始化脚本

```sql
-- 创建产品套餐表
CREATE TABLE IF NOT EXISTS products (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '产品ID',
  name VARCHAR(100) NOT NULL COMMENT '产品名称',
  description TEXT NULL COMMENT '产品描述',
  price DECIMAL(10,2) NOT NULL COMMENT '产品价格',
  original_price DECIMAL(10,2) NULL COMMENT '原价',
  duration_days INT NOT NULL COMMENT '有效期(天数)',
  max_domains INT NOT NULL COMMENT '最大域名数量',
  max_subdomains INT NOT NULL COMMENT '最大二级域名数量',
  features JSON NULL COMMENT '功能特性',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否启用',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_name (name),
  INDEX idx_is_active (is_active),
  INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='产品套餐表';

-- 创建订单表
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订单ID',
  order_no VARCHAR(50) NOT NULL UNIQUE COMMENT '订单号',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  product_id BIGINT UNSIGNED NOT NULL COMMENT '产品ID',
  product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
  price DECIMAL(10,2) NOT NULL COMMENT '订单金额',
  discount_amount DECIMAL(10,2) DEFAULT 0.00 COMMENT '优惠金额',
  final_amount DECIMAL(10,2) NOT NULL COMMENT '实付金额',
  status ENUM('pending', 'paid', 'cancelled', 'expired', 'refunded') DEFAULT 'pending' COMMENT '订单状态',
  payment_method VARCHAR(50) NULL COMMENT '支付方式',
  payment_time TIMESTAMP NULL COMMENT '支付时间',
  paid_at DATETIME NULL COMMENT '支付完成时间',
  transaction_id VARCHAR(100) NULL COMMENT '第三方交易号',
  expires_at DATETIME NOT NULL COMMENT '订单过期时间',
  remark TEXT NULL COMMENT '订单备注',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_order_no (order_no),
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_payment_time (payment_time),
  INDEX idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='订单表';

-- 创建用户订阅表
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '订阅ID',
  user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
  product_id BIGINT UNSIGNED NOT NULL COMMENT '产品ID',
  product_name VARCHAR(100) NOT NULL COMMENT '产品名称',
  start_date DATETIME NOT NULL COMMENT '订阅开始时间',
  end_date DATETIME NOT NULL COMMENT '订阅结束时间',
  max_domains INT NOT NULL COMMENT '最大域名数量',
  max_subdomains INT NOT NULL COMMENT '最大二级域名数量',
  used_domains INT DEFAULT 0 COMMENT '已使用域名数量',
  used_subdomains INT DEFAULT 0 COMMENT '已使用二级域名数量',
  features JSON NULL COMMENT '功能特性',
  is_active TINYINT(1) DEFAULT 1 COMMENT '是否激活',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  INDEX idx_product_id (product_id),
  INDEX idx_end_date (end_date),
  INDEX idx_is_active (is_active),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户订阅表';

-- 创建支付日志表
CREATE TABLE IF NOT EXISTS payment_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '日志ID',
  order_id BIGINT UNSIGNED NOT NULL COMMENT '订单ID',
  order_no VARCHAR(50) NOT NULL COMMENT '订单号',
  payment_method VARCHAR(50) NOT NULL COMMENT '支付方式',
  transaction_id VARCHAR(100) NULL COMMENT '第三方交易号',
  amount DECIMAL(10,2) NOT NULL COMMENT '支付金额',
  status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL COMMENT '支付状态',
  request_data JSON NULL COMMENT '请求数据',
  response_data JSON NULL COMMENT '响应数据',
  error_message TEXT NULL COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_order_id (order_id),
  INDEX idx_order_no (order_no),
  INDEX idx_transaction_id (transaction_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付日志表';

-- 创建用户余额表
CREATE TABLE IF NOT EXISTS user_balance (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '主键ID',
  user_id BIGINT UNSIGNED NOT NULL UNIQUE COMMENT '用户ID',
  balance DECIMAL(10,2) DEFAULT 0.00 COMMENT '当前余额',
  total_recharge DECIMAL(10,2) DEFAULT 0.00 COMMENT '总充值金额',
  total_consumed DECIMAL(10,2) DEFAULT 0.00 COMMENT '总消费金额',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_user_id (user_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户余额表';

-- 创建余额交易记录表
CREATE TABLE IF NOT EXISTS balance_transactions (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '交易ID',
  user_id BIGINT UNSIGNED NOT NULL COMMENT '用户ID',
  type ENUM('recharge', 'consume', 'refund', 'withdraw', 'system') NOT NULL COMMENT '交易类型',
  amount DECIMAL(10,2) NOT NULL COMMENT '交易金额',
  balance_before DECIMAL(10,2) NOT NULL COMMENT '交易前余额',
  balance_after DECIMAL(10,2) NOT NULL COMMENT '交易后余额',
  description VARCHAR(255) NULL COMMENT '交易描述',
  related_order_id BIGINT UNSIGNED NULL COMMENT '关联订单ID',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  INDEX idx_user_id (user_id),
  INDEX idx_type (type),
  INDEX idx_related_order_id (related_order_id),
  INDEX idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (related_order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='余额交易记录表';

-- 插入初始产品数据
INSERT INTO products (name, description, price, original_price, duration_days, max_domains, max_subdomains, features, is_active, sort_order) VALUES
('免费版', '适合个人用户使用,包含基础功能', 0.00, 0.00, 30, 1, 5, '{"custom_dns": false, "ssl_certificate": false, "api_access": false, "priority_support": false}', 1, 0),
('基础版', '适合小型团队,提供更多功能和资源', 29.90, 59.90, 30, 5, 50, '{"custom_dns": true, "ssl_certificate": false, "api_access": true, "priority_support": false}', 1, 1),
('专业版', '适合企业用户,提供完整功能和优先支持', 99.90, 199.90, 30, 20, 200, '{"custom_dns": true, "ssl_certificate": true, "api_access": true, "priority_support": true}', 1, 2);
```

---

### 14.2 支付配置数据库表

为了便于动态管理和配置支付方式,本系统将所有支付配置存储在数据库中。

#### 14.2.1 支付配置表结构 (payment_settings)

```sql
-- 创建支付配置表
CREATE TABLE IF NOT EXISTS payment_settings (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY COMMENT '配置ID',
  payment_method VARCHAR(50) NOT NULL UNIQUE COMMENT '支付方式(alipay/wechat/epay)',
  payment_name VARCHAR(100) NOT NULL COMMENT '支付方式名称',
  config_data JSON NOT NULL COMMENT '配置数据(JSON格式)',
  is_enabled TINYINT(1) DEFAULT 0 COMMENT '是否启用(0:未启用, 1:已启用)',
  sort_order INT DEFAULT 0 COMMENT '排序顺序',
  description TEXT NULL COMMENT '配置描述',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  INDEX idx_payment_method (payment_method),
  INDEX idx_is_enabled (is_enabled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='支付配置表';
```

#### 14.2.2 配置数据结构

**支付宝配置 (alipay)**:
```json
{
  "appId": "2021xxxxxxxx",
  "privateKey": "-----BEGIN RSA PRIVATE KEY-----
...
-----END RSA PRIVATE KEY-----",
  "alipayPublicKey": "-----BEGIN PUBLIC KEY-----
...
-----END PUBLIC KEY-----",
  "gatewayUrl": "https://openapi.alipay.com/gateway.do",
  "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/alipay",
  "returnUrl": "https://yourdomain.com/payment/return"
}
```

**微信支付配置 (wechat)**:
```json
{
  "appId": "wx1234567890abcdef",
  "mchId": "1234567890",
  "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "certPath": "/path/to/apiclient_cert.pem",
  "keyPath": "/path/to/apiclient_key.pem",
  "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/wechat"
}
```

**易支付配置 (epay)**:
```json
{
  "pid": "1000",
  "key": "your_epay_key",
  "apiUrl": "https://epay.example.com",
  "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/epay",
  "returnUrl": "https://yourdomain.com/payment/return"
}
```

#### 14.2.3 初始化数据SQL

```sql
-- 插入支付宝配置示例
INSERT INTO payment_settings (payment_method, payment_name, config_data, is_enabled, sort_order, description) VALUES
('alipay', '支付宝', 
 '{"appId":"","privateKey":"","alipayPublicKey":"","gatewayUrl":"https://openapi.alipay.com/gateway.do","notifyUrl":"https://yourdomain.com/api/v1/payments/callback/alipay","returnUrl":"https://yourdomain.com/payment/return"}',
 0, 1, '支付宝支付配置');

-- 插入微信支付配置示例
INSERT INTO payment_settings (payment_method, payment_name, config_data, is_enabled, sort_order, description) VALUES
('wechat', '微信支付', 
 '{"appId":"","mchId":"","apiKey":"","certPath":"","keyPath":"","notifyUrl":"https://yourdomain.com/api/v1/payments/callback/wechat"}',
 0, 2, '微信支付配置');

-- 插入易支付配置示例
INSERT INTO payment_settings (payment_method, payment_name, config_data, is_enabled, sort_order, description) VALUES
('epay', '易支付', 
 '{"pid":"","key":"","apiUrl":"https://epay.example.com","notifyUrl":"https://yourdomain.com/api/v1/payments/callback/epay","returnUrl":"https://yourdomain.com/payment/return"}',
 0, 3, '易支付聚合支付配置(支持支付宝/微信/QQ支付)');
```

---

### 14.3 支付配置管理接口

#### 14.3.1 获取所有支付配置

获取系统中所有支付方式的配置列表。

*   **接口地址**: `GET /api/v1/admin/payment/settings`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求示例**:
```
GET /api/v1/admin/payment/settings
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 3,
    "list": [
      {
        "id": 1,
        "paymentMethod": "alipay",
        "paymentName": "支付宝",
        "configData": {
          "appId": "2021xxxxxxxx",
          "privateKey": "***hidden***",
          "alipayPublicKey": "***hidden***",
          "gatewayUrl": "https://openapi.alipay.com/gateway.do",
          "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/alipay",
          "returnUrl": "https://yourdomain.com/payment/return"
        },
        "isEnabled": true,
        "sortOrder": 1,
        "description": "支付宝支付配置",
        "createdAt": "2024-01-24T10:00:00.000Z",
        "updatedAt": "2024-01-24T10:00:00.000Z"
      },
      {
        "id": 2,
        "paymentMethod": "wechat",
        "paymentName": "微信支付",
        "configData": {
          "appId": "wx1234567890abcdef",
          "mchId": "1234567890",
          "apiKey": "***hidden***",
          "certPath": "/path/to/apiclient_cert.pem",
          "keyPath": "/path/to/apiclient_key.pem",
          "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/wechat"
        },
        "isEnabled": true,
        "sortOrder": 2,
        "description": "微信支付配置",
        "createdAt": "2024-01-24T10:00:00.000Z",
        "updatedAt": "2024-01-24T10:00:00.000Z"
      },
      {
        "id": 3,
        "paymentMethod": "epay",
        "paymentName": "易支付",
        "configData": {
          "pid": "1000",
          "key": "***hidden***",
          "apiUrl": "https://epay.example.com",
          "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/epay",
          "returnUrl": "https://yourdomain.com/payment/return"
        },
        "isEnabled": false,
        "sortOrder": 3,
        "description": "易支付聚合支付配置",
        "createdAt": "2024-01-24T10:00:00.000Z",
        "updatedAt": "2024-01-24T10:00:00.000Z"
      }
    ]
  },
  "timestamp": 1698765432000
}
```

**注意事项**:
- 敏感信息如私钥、API密钥等在返回时会被隐藏(显示为***hidden***)
- 只有管理员可以查看完整配置

#### 14.3.2 获取单个支付配置详情

获取指定支付方式的完整配置信息。

*   **接口地址**: `GET /api/v1/admin/payment/settings/:paymentMethod`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| paymentMethod | string | 是 | 支付方式(alipay/wechat/epay) |

*   **请求示例**:
```
GET /api/v1/admin/payment/settings/alipay
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "id": 1,
    "paymentMethod": "alipay",
    "paymentName": "支付宝",
    "configData": {
      "appId": "2021xxxxxxxx",
      "privateKey": "-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAwL...
-----END RSA PRIVATE KEY-----",
      "alipayPublicKey": "-----BEGIN PUBLIC KEY-----
MIIBIjANBgk...
-----END PUBLIC KEY-----",
      "gatewayUrl": "https://openapi.alipay.com/gateway.do",
      "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/alipay",
      "returnUrl": "https://yourdomain.com/payment/return"
    },
    "isEnabled": true,
    "sortOrder": 1,
    "description": "支付宝支付配置",
    "createdAt": "2024-01-24T10:00:00.000Z",
    "updatedAt": "2024-01-24T10:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 不存在的支付方式)**:
```json
{
  "code": 1001,
  "message": "不支持的支付方式",
  "data": null,
  "timestamp": 1698765432000
}
```

#### 14.3.3 更新支付配置

更新指定支付方式的配置信息。

*   **接口地址**: `PUT /api/v1/admin/payment/settings/:paymentMethod`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| paymentMethod | string | 是 | 支付方式(alipay/wechat/epay) |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| configData | object | 是 | 配置数据(JSON对象) |
| isEnabled | boolean | 否 | 是否启用 |
| sortOrder | number | 否 | 排序顺序 |
| description | string | 否 | 配置描述 |

*   **请求示例 (支付宝)**:
```json
PUT /api/v1/admin/payment/settings/alipay
{
  "configData": {
    "appId": "2021xxxxxxxx",
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAwL...
-----END RSA PRIVATE KEY-----",
    "alipayPublicKey": "-----BEGIN PUBLIC KEY-----
MIIBIjANBgk...
-----END PUBLIC KEY-----",
    "gatewayUrl": "https://openapi.alipay.com/gateway.do",
    "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/alipay",
    "returnUrl": "https://yourdomain.com/payment/return"
  },
  "isEnabled": true,
  "sortOrder": 1,
  "description": "支付宝支付配置"
}
```

*   **请求示例 (易支付)**:
```json
PUT /api/v1/admin/payment/settings/epay
{
  "configData": {
    "pid": "1000",
    "key": "your_epay_key",
    "apiUrl": "https://epay.example.com",
    "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/epay",
    "returnUrl": "https://yourdomain.com/payment/return"
  },
  "isEnabled": true,
  "sortOrder": 3,
  "description": "易支付聚合支付配置"
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "更新成功",
  "data": {
    "id": 1,
    "paymentMethod": "alipay",
    "paymentName": "支付宝",
    "configData": {
      "appId": "2021xxxxxxxx",
      "privateKey": "***hidden***",
      "alipayPublicKey": "***hidden***",
      "gatewayUrl": "https://openapi.alipay.com/gateway.do",
      "notifyUrl": "https://yourdomain.com/api/v1/payments/callback/alipay",
      "returnUrl": "https://yourdomain.com/payment/return"
    },
    "isEnabled": true,
    "sortOrder": 1,
    "description": "支付宝支付配置",
    "createdAt": "2024-01-24T10:00:00.000Z",
    "updatedAt": "2024-01-24T10:35:00.000Z"
  },
  "timestamp": 1698765432000
}
```

*   **响应示例 (失败 - 配置验证失败)**:
```json
{
  "code": 1002,
  "message": "配置验证失败:appId不能为空",
  "data": null,
  "timestamp": 1698765432000
}
```

#### 14.3.4 启用/禁用支付方式

快速启用或禁用指定的支付方式。

*   **接口地址**: `PATCH /api/v1/admin/payment/settings/:paymentMethod/toggle`
*   **是否需要认证**: 是
*   **所需权限**: admin
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **路径参数 (URL)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| paymentMethod | string | 是 | 支付方式(alipay/wechat/epay) |

*   **请求参数 (Body)**:

| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| isEnabled | boolean | 是 | 是否启用(true/false) |

*   **请求示例**:
```json
PATCH /api/v1/admin/payment/settings/epay/toggle
{
  "isEnabled": true
}
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "支付方式已启用",
  "data": {
    "paymentMethod": "epay",
    "isEnabled": true
  },
  "timestamp": 1698765432000
}
```

#### 14.3.5 获取用户可用的支付方式

获取普通用户在购买套餐时可用的支付方式列表。

*   **接口地址**: `GET /api/v1/payment/methods`
*   **是否需要认证**: 是
*   **请求头 (Headers)**:
    *   `Authorization: Bearer <token>`

*   **请求示例**:
```
GET /api/v1/payment/methods
```

*   **响应示例 (成功)**:
```json
{
  "code": 0,
  "message": "获取成功",
  "data": {
    "total": 2,
    "methods": [
      {
        "paymentMethod": "alipay",
        "paymentName": "支付宝",
        "icon": "https://yourdomain.com/icons/alipay.png",
        "description": "支持支付宝扫码和网页支付"
      },
      {
        "paymentMethod": "epay",
        "paymentName": "易支付",
        "icon": "https://yourdomain.com/icons/epay.png",
        "description": "支持支付宝、微信、QQ支付",
        "subMethods": ["alipay", "wechat", "qqpay"]
      }
    ]
  },
  "timestamp": 1698765432000
}
```

**注意事项**:
- 只返回已启用(isEnabled=true)的支付方式
- 不包含敏感配置信息
- 可直接用于前端支付方式选择器

#### 14.3.6 配置验证规则

**支付宝配置验证**:
- appId: 必填,字符串格式
- privateKey: 必填,合法的RSA私钥格式
- alipayPublicKey: 必填,合法的RSA公钥格式
- gatewayUrl: 必填,合法的URL格式
- notifyUrl: 必填,合法的URL格式
- returnUrl: 可选,合法的URL格式

**微信支付配置验证**:
- appId: 必填,合法的微信小程序/公众号AppID
- mchId: 必填,10位数字的商户号
- apiKey: 必填,32位字符串的API密钥
- certPath: 可选,合法的文件路径(如需退款功能)
- keyPath: 可选,合法的文件路径(如需退款功能)
- notifyUrl: 必填,合法的URL格式

**易支付配置验证**:
- pid: 必填,数字格式的商户ID
- key: 必填,字符串格式的商户密钥
- apiUrl: 必填,合法的URL格式
- notifyUrl: 必填,合法的URL格式
- returnUrl: 可选,合法的URL格式

#### 14.3.7 安全注意事项

1. **敏感信息加密**:
   - 存储在数据库中的私钥、密钥等敏感信息应加密存储
   - 使用AES-256等强加密算法
   - 加密密钥应该存储在环境变量中,不应写入代码

2. **权限控制**:
   - 只有管理员可以查看和修改支付配置
   - 普通用户只能获取已启用的支付方式列表
   - 添加操作日志记录所有配置变更

3. **配置验证**:
   - 更新配置时必须验证所有必填字段
   - 验证证书文件的合法性(微信支付)
   - 验证URL格式的正确性

4. **数据隐藏**:
   - 列表接口和详情接口应隐藏敏感信息(使用***hidden***代替)
   - 只有在更新接口和内部服务中才使用完整配置

5. **审计日志**:
   - 记录所有配置变更操作
   - 包括操作人、操作时间、变更内容

---

### 14.4 支付配置服务示例代码

```javascript
const crypto = require('crypto');
const PaymentSettings = require('../models/PaymentSettings');

class PaymentConfigService {
  // 加密密钥(从环境变量读取)
  static ENCRYPTION_KEY = process.env.PAYMENT_ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
  
  /**
   * 加密敏感信息
   */
  static encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
  }
  
  /**
   * 解密敏感信息
   */
  static decrypt(text) {
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encrypted = parts[1];
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(this.ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
  
  /**
   * 获取支付配置(解密敏感信息)
   */
  static async getConfig(paymentMethod) {
    const setting = await PaymentSettings.findOne({
      where: { paymentMethod: paymentMethod }
    });
    
    if (!setting) {
      throw new Error(`支付方式 ${paymentMethod} 未配置`);
    }
    
    if (!setting.isEnabled) {
      throw new Error(`支付方式 ${paymentMethod} 未启用`);
    }
    
    // 解密配置中的敏感信息
    const config = setting.configData;
    const decryptedConfig = {};
    
    for (const [key, value] of Object.entries(config)) {
      // 解密敏感字段
      if (['privateKey', 'alipayPublicKey', 'apiKey', 'key'].includes(key)) {
        try {
          decryptedConfig[key] = this.decrypt(value);
        } catch (error) {
          console.error(`解密 ${key} 失败:`, error);
          decryptedConfig[key] = value;
        }
      } else {
        decryptedConfig[key] = value;
      }
    }
    
    return decryptedConfig;
  }
  
  /**
   * 获取支付配置列表(隐藏敏感信息)
   */
  static async getConfigList() {
    const settings = await PaymentSettings.findAll({
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });
    
    return settings.map(setting => {
      const config = setting.configData;
      const sanitizedConfig = {};
      
      // 隐藏敏感字段
      for (const [key, value] of Object.entries(config)) {
        if (['privateKey', 'alipayPublicKey', 'apiKey', 'key'].includes(key)) {
          sanitizedConfig[key] = '***hidden***';
        } else {
          sanitizedConfig[key] = value;
        }
      }
      
      return {
        id: setting.id,
        paymentMethod: setting.paymentMethod,
        paymentName: setting.paymentName,
        configData: sanitizedConfig,
        isEnabled: setting.isEnabled,
        sortOrder: setting.sortOrder,
        description: setting.description,
        createdAt: setting.createdAt,
        updatedAt: setting.updatedAt
      };
    });
  }
  
  /**
   * 更新支付配置
   */
  static async updateConfig(paymentMethod, updateData) {
    const setting = await PaymentSettings.findOne({
      where: { paymentMethod: paymentMethod }
    });
    
    if (!setting) {
      throw new Error(`支付方式 ${paymentMethod} 不存在`);
    }
    
    // 验证配置
    this.validateConfig(paymentMethod, updateData.configData);
    
    // 加密敏感信息
    const config = updateData.configData;
    const encryptedConfig = {};
    
    for (const [key, value] of Object.entries(config)) {
      if (['privateKey', 'alipayPublicKey', 'apiKey', 'key'].includes(key)) {
        try {
          encryptedConfig[key] = this.encrypt(value);
        } catch (error) {
          console.error(`加密 ${key} 失败:`, error);
          encryptedConfig[key] = value;
        }
      } else {
        encryptedConfig[key] = value;
      }
    }
    
    // 更新配置
    setting.configData = encryptedConfig;
    setting.isEnabled = updateData.isEnabled !== undefined ? updateData.isEnabled : setting.isEnabled;
    setting.sortOrder = updateData.sortOrder !== undefined ? updateData.sortOrder : setting.sortOrder;
    setting.description = updateData.description !== undefined ? updateData.description : setting.description;
    
    await setting.save();
    
    return setting;
  }
  
  /**
   * 验证配置
   */
  static validateConfig(paymentMethod, config) {
    const validators = {
      alipay: {
        required: ['appId', 'privateKey', 'alipayPublicKey', 'gatewayUrl', 'notifyUrl'],
        format: {
          appId: /^[a-zA-Z0-9]{16}$/, // 支付宝AppID格式
          gatewayUrl: /^https?://.+/,
          notifyUrl: /^https?://.+/
        }
      },
      wechat: {
        required: ['appId', 'mchId', 'apiKey', 'notifyUrl'],
        format: {
          appId: /^wx[a-f0-9]{16}$/, // 微信AppID格式
          mchId: /^\d{10}$/, // 10位数字
          apiKey: /^[a-f0-9]{32}$/, // 32位十六进制
          notifyUrl: /^https?://.+/
        }
      },
      epay: {
        required: ['pid', 'key', 'apiUrl', 'notifyUrl'],
        format: {
          pid: /^\d+$/,
          apiUrl: /^https?://.+/,
          notifyUrl: /^https?://.+/
        }
      }
    };
    
    const validator = validators[paymentMethod];
    if (!validator) {
      throw new Error(`不支持的支付方式: ${paymentMethod}`);
    }
    
    // 检查必填字段
    for (const field of validator.required) {
      if (!config[field]) {
        throw new Error(`${paymentMethod}配置缺少必填字段: ${field}`);
      }
    }
    
    // 检查格式
    for (const [field, regex] of Object.entries(validator.format)) {
      if (config[field] && !regex.test(config[field])) {
        throw new Error(`${paymentMethod}配置字段 ${field} 格式不正确`);
      }
    }
  }
  
  /**
   * 获取用户可用的支付方式列表
   */
  static async getAvailableMethods() {
    const settings = await PaymentSettings.findAll({
      where: { isEnabled: true },
      order: [['sortOrder', 'ASC'], ['id', 'ASC']]
    });
    
    return settings.map(setting => {
      const method = {
        paymentMethod: setting.paymentMethod,
        paymentName: setting.paymentName,
        icon: `/icons/${setting.paymentMethod}.png`,
        description: setting.description || ''
      };
      
      // 易支付支持多种子支付方式
      if (setting.paymentMethod === 'epay') {
        method.subMethods = ['alipay', 'wechat', 'qqpay'];
      }
      
      return method;
    });
  }
}

module.exports = PaymentConfigService;
```

---

### 14.5 易支付对接指南

#### 14.3.1 易支付简介
易支付是一个第三方聚合支付平台,支持支付宝、微信支付、QQ支付等多种支付方式,适合个人或小商户使用。通过对接易支付,可以快速接入多种支付渠道。

#### 14.3.2 申请易支付账号
1. 访问易支付官网注册账号
2. 完成实名认证
3. 在商户后台获取:
   - 商户ID (pid)
   - 商户密钥 (key)
   - API地址
4. 配置异步通知地址和同步跳转地址

#### 14.3.3 签名规则

**签名生成步骤**:
1. 将所有非空参数按字典序排序
2. 拼接成字符串: 参数1值1参数2值2...
3. 在字符串末尾追加商户密钥(key)
4. 对拼接后的字符串进行MD5加密
5. 将加密结果转换为大写

**示例代码**:
```javascript
const crypto = require('crypto');

function generateSign(params, key) {
  // 1. 过滤空值参数并排序
  const sortedParams = Object.keys(params)
    .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
    .sort()
    .reduce((result, key) => {
      result[key] = params[key];
      return result;
    }, {});

  // 2. 拼接字符串
  const paramString = Object.keys(sortedParams)
    .map(key => `${key}=${sortedParams[key]}`)
    .join('');

  // 3. 追加密钥并MD5加密
  const signString = paramString + key;
  const sign = crypto.createHash('md5').update(signString).digest('hex').toUpperCase();

  return sign;
}

// 使用示例
const params = {
  pid: 1000,
  out_trade_no: '202401241234567890',
  money: 29.90,
  type: 'alipay',
  notify_url: 'https://yourdomain.com/api/v1/payments/callback/epay',
  return_url: 'https://yourdomain.com/payment/return'
};

const sign = generateSign(params, 'your_epay_key');
```

#### 14.3.4 创建支付订单

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| pid | string | 是 | 商户ID |
| type | string | 是 | 支付类型(alipay/wechat/qqpay) |
| out_trade_no | string | 是 | 商户订单号 |
| notify_url | string | 是 | 异步通知地址 |
| return_url | string | 是 | 同步跳转地址 |
| name | string | 是 | 商品名称 |
| money | string | 是 | 支付金额 |
| clientip | string | 否 | 客户端IP |
| device | string | 否 | 终端类型(pc/mobile) |
| sign | string | 是 | 签名 |

**响应格式**:
```json
{
  "code": 1,
  "msg": "提交成功",
  "qrcode": "https://epay.example.com/qrcode.php?data=xxx",
  "payurl": "https://epay.example.com/submit.php?pid=xxx&..."
}
```

#### 14.3.5 异步通知(回调)

**通知参数**:
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

**响应格式**:
```
success
```

#### 14.3.6 查询订单

**请求地址**: 易支付API地址 + `/api.php?act=order`

**请求参数**:
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| pid | string | 是 | 商户ID |
| out_trade_no | string | 是 | 商户订单号 |
| sign | string | 是 | 签名 |

**响应格式**:
```json
{
  "code": 1,
  "msg": "查询成功",
  "data": {
    "trade_no": "EPAY202401241234567890123",
    "out_trade_no": "202401241234567890",
    "type": "alipay",
    "name": "基础版套餐",
    "money": "29.90",
    "trade_status": "TRADE_SUCCESS",
    "time": "2024-01-24 12:35:00",
    "buyer_email": "buyer@example.com",
    "notify_time": "2024-01-24 12:35:05"
  }
}
```

#### 14.5.7 Node.js对接示例(数据库配置版)

```javascript
const axios = require('axios');
const crypto = require('crypto');
const PaymentConfigService = require('./PaymentConfigService');

class EpayService {
  /**
   * 生成签名
   */
  static async generateSign(params) {
    // 从数据库获取易支付配置
    const config = await PaymentConfigService.getConfig('epay');
    const key = config.key;
    
    const sortedParams = Object.keys(params)
      .filter(key => params[key] !== '' && params[key] !== null && params[key] !== undefined)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key];
        return result;
      }, {});

    const paramString = Object.keys(sortedParams)
      .map(key => `${key}=${sortedParams[key]}`)
      .join('');

    const signString = paramString + key;
    return crypto.createHash('md5').update(signString).digest('hex').toUpperCase();
  }

  /**
   * 验证签名
   */
  static async verifySign(params) {
    const receivedSign = params.sign;
    delete params.sign;

    const calculatedSign = await this.generateSign(params);

    return receivedSign === calculatedSign;
  }

  /**
   * 创建支付订单
   */
  static async createPayment(orderData, paymentType) {
    // 从数据库获取易支付配置
    const config = await PaymentConfigService.getConfig('epay');
    
    const params = {
      pid: config.pid,
      type: paymentType, // alipay, wechat, qqpay
      out_trade_no: orderData.orderNo,
      notify_url: config.notifyUrl,
      return_url: config.returnUrl,
      name: orderData.productName,
      money: orderData.amount.toFixed(2),
      sign: '' // 先留空,最后生成
    };

    // 生成签名
    params.sign = await this.generateSign(params);

    // 构建支付URL
    const queryString = Object.keys(params)
      .map(key => `${key}=${encodeURIComponent(params[key])}`)
      .join('&');

    const paymentUrl = `${config.apiUrl}/submit.php?${queryString}`;
    const qrCode = `${config.apiUrl}/qrcode.php?data=${encodeURIComponent(paymentUrl)}`;

    return {
      paymentUrl,
      qrCode,
      sign: params.sign
    };
  }

  /**
   * 查询订单
   */
  static async queryOrder(orderNo) {
    // 从数据库获取易支付配置
    const config = await PaymentConfigService.getConfig('epay');
    
    const params = {
      pid: config.pid,
      out_trade_no: orderNo,
      act: 'order',
      sign: ''
    };

    // 生成签名
    params.sign = await this.generateSign(params);

    // 请求易支付API
    const response = await axios.post(`${config.apiUrl}/api.php`, new URLSearchParams(params), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    return response.data;
  }

  /**
   * 处理异步通知
   */
  static async handleNotify(notificationData) {
    // 验证签名
    if (!(await this.verifySign(notificationData))) {
      throw new Error('签名验证失败');
    }

    // 检查订单状态
    if (notificationData.trade_status !== 'TRADE_SUCCESS') {
      throw new Error('订单未支付成功');
    }

    // 验证金额
    const expectedAmount = parseFloat(notificationData.money);
    // 这里需要查询订单验证金额

    return {
      outTradeNo: notificationData.out_trade_no,
      tradeNo: notificationData.trade_no,
      tradeStatus: notificationData.trade_status,
      totalFee: expectedAmount,
      tradeTime: notificationData.time,
      buyerEmail: notificationData.buyer_email,
      notifyTime: notificationData.time
    };
  }
}

module.exports = EpayService;
```

#### 14.3.8 安全注意事项
1. **签名验证**: 所有回调通知必须验证签名,确保请求来自易支付服务器
2. **金额验证**: 回调金额必须与订单金额一致,防止金额篡改
3. **幂等处理**: 防止重复回调导致重复处理,需要记录已处理的订单
4. **HTTPS**: 生产环境必须使用HTTPS,确保数据传输安全
5. **密钥安全**: 商户密钥必须妥善保管,不要泄露给第三方

#### 14.3.9 常见问题

**Q: 签名验证失败怎么办?**
A: 检查以下内容:
- 商户密钥(key)是否正确
- 参数拼接顺序是否按字典序
- 签名是否转换为大写
- 参数值是否进行了URL编码

**Q: 回调没有收到怎么办?**
A: 检查以下内容:
- 异步通知地址是否配置正确
- 服务器是否正常响应"success"
- 防火墙是否拦截了易支付服务器IP
- 网络是否通畅

**Q: 订单重复支付怎么办?**
A: 在处理回调前先检查订单状态:
- 如果订单已支付,直接返回"success"
- 如果订单不存在或已取消,不处理
- 确保订单处理的幂等性

**Q: 如何测试易支付接口?**
A: 易支付通常提供测试环境:
- 使用测试账号进行测试
- 测试金额一般较小
- 测试成功后切换到生产环境

---

### 14.6 环境变量配置

虽然支付配置存储在数据库中,但仍需要少量环境变量用于安全和加密目的。

```bash
# 支付配置加密密钥(必填)
PAYMENT_ENCRYPTION_KEY=your-very-secure-encryption-key-here

# 说明:
# - 用于加密/解密数据库中存储的敏感支付信息(如私钥、API密钥等)
# - 必须设置为强密码,建议使用至少32位的随机字符串
# - 一旦设置并存储了加密数据,不要轻易修改,否则会导致数据无法解密
# - 生产环境必须设置,开发环境可以使用默认值但会有安全风险
```

**注意事项**:
1. 所有支付配置(支付宝、微信、易支付)都存储在数据库 `payment_settings` 表中
2. 只有加密密钥需要放在环境变量中
3. 敏感信息在数据库中加密存储,使用时自动解密
4. 通过后台管理接口动态配置支付方式,无需重启服务器
5. 支持热更新,配置修改后立即生效

---

### 14.7 配置管理最佳实践

1. **配置初始化**:
   - 首次部署时运行初始化SQL脚本创建默认配置
   - 通过管理后台更新实际的支付配置信息
   - 测试配置是否正确可用

2. **配置更新**:
   - 更新配置前先备份现有配置
   - 使用测试环境验证新配置
   - 生产环境更新时选择低峰期进行

3. **安全建议**:
   - 定期更换支付商户密钥
   - 加密密钥应该存储在安全的位置,不要提交到代码仓库
   - 使用数据库备份功能定期备份配置数据
   - 记录所有配置变更操作,便于审计和追溯

4. **监控告警**:
   - 监控支付接口调用失败率
   - 配置变更后发送告警通知
   - 定期检查支付配置的有效性

---

**文档版本**: V1.2
**更新日期**: 2024-01-24
**维护人员**: 开发团队


