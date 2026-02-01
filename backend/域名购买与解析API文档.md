# 域名购买与解析API文档

## 文档说明

本文档描述域名购买和解析系统的完整API接口，包含两个核心业务流程：
1. **用户添加解析流程** - 购买单条解析记录
2. **用户购买套餐流程** - 购买域名解析套餐（解析抵扣包）

---

## 核心概念

| 概念 | 说明 |
|------|------|
| **可购买域名** | domains表中 `is_public=1` 的域名，用户可以购买解析服务 |
| **解析记录** | 用户在域名下添加的单条DNS解析（A/CNAME/AAAA） |
| **套餐** | 管理员配置的域名解析包，包含：可解析次数、时长、价格 |
| **套餐抵扣** | 用户添加解析时，优先使用已购买套餐中的解析次数 |

---

## 数据库核心表

### domains 表（域名表）
```sql
- id: 域名ID
- domain_name: 域名名称
- price: 单条解析价格（未购买套餐时使用）
- is_public: 是否公开可购买(1=是,0=否)
- require_icp: 是否需要实名认证(1=是,0=否)
```

### domain_packages 表（套餐表）
```sql
- id: 套餐ID
- domain_id: 关联域名ID
- name: 套餐名称
- parse_count: 解析次数（可添加多少条解析记录）
- duration_days: 有效时长（天）
- price: 套餐价格
```

### user_packages 表（用户套餐表）
```sql
- id: 用户套餐ID
- user_id: 用户ID
- package_id: 套餐ID
- domain_id: 域名ID
- total_count: 总解析次数
- used_count: 已使用次数
- valid_start: 有效期开始
- valid_end: 有效期结束
- status: 状态(active/expired)
```

### domain_records 表（解析记录表）
```sql
- id: 记录ID
- user_id: 用户ID
- domain_id: 域名ID
- website_name: 网站名称
- hostname: 主机名
- record_type: 解析类型(A/CNAME/AAAA)
- record_value: 解析记录值
- ttl: TTL值(默认600)
- remark: 备注
- status: 状态(pending/reviewing/active/rejected)
```

---

## 第一部分：用户添加解析流程

### 流程概述
```
选择域名 → 填写解析信息 → 检查套餐/计算价格 → 创建订单 → 获取支付方式 → 支付 → 管理员审核 → 添加解析到云平台
```

---

### 1. 获取可购买域名列表
已完成
获取所有公开可购买的域名列表（domains表中is_public=1的记录）

- **接口地址**: `GET /api/v1/domains/public`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "domainName": "example.com",
        "price": 9.90,
        "requireIcp": true,
        "description": "优质域名",
        "isPublic": true
      },
      {
        "id": 2,
        "domainName": "test.net",
        "price": 4.90,
        "requireIcp": false,
        "description": "个人友好",
        "isPublic": true
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 2. 检查用户实名状态

检查当前用户是否已完成实名认证（当域名require_icp=1时需要）

- **接口地址**: `GET /api/v1/user/verification/status`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "isVerified": true
  }
}
```

---

### 3. 检查主机名是否可用
已完成
检查指定主机名是否已存在（防止重复添加）

- **接口地址**: `GET /api/v1/domains/:domainId/check-hostname`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| hostname | string | 是 | 主机名（如：www, blog, @表示根域名） |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "available": true,
    "message": "主机名可用"
  }
}
```

**响应示例（主机名已存在）**:
```json
{
  "code": 2009,
  "message": "主机名已存在",
  "data": {
    "available": false,
    "existingRecord": {
      "id": 101,
      "hostname": "www",
      "recordType": "A",
      "status": "active"
    }
  }
}
```

---

### 4. 检查用户套餐状态

检查用户在指定域名下的套餐情况（用于判断是否有可用解析次数）

- **接口地址**: `GET /api/v1/user/packages/check`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| domainId | number | 是 | 域名ID |

**响应示例（有可用套餐）**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "hasPackage": true,
    "packages": [
      {
        "packageId": 1,
        "packageName": "基础套餐",
        "totalCount": 10,
        "usedCount": 3,
        "availableCount": 7,
        "validEnd": "2024-12-31T23:59:59.000Z"
      }
    ],
    "totalAvailable": 7,
    "canUsePackage": true
  }
}
```

**响应示例（无可用套餐）**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "hasPackage": false,
    "packages": [],
    "totalAvailable": 0,
    "canUsePackage": false,
    "singlePrice": 9.90
  }
}
```

---

### 5. 创建解析订单

用户提交解析信息，创建解析订单。系统会自动判断：
- 有可用套餐 → 直接扣除套餐次数，订单金额=0
- 无可用套餐 → 使用domains表的price字段计算价格

- **接口地址**: `POST /api/v1/parse-orders`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| domainId | number | 是 | 域名ID |
| websiteName | string | 是 | 网站名称（1-50字符） |
| hostname | string | 是 | 主机名（如：www, blog, @） |
| recordType | string | 是 | 解析类型：A/CNAME/AAAA |
| recordValue | string | 是 | 解析记录值 |
| remark | string | 否 | 备注说明（0-200字符） |

**请求示例**:
```json
{
  "domainId": 1,
  "websiteName": "我的博客",
  "hostname": "www",
  "recordType": "A",
  "recordValue": "192.168.1.1",
  "remark": "个人博客网站"
}
```

**响应示例（使用套餐抵扣）**:
```json
{
  "code": 0,
  "message": "订单创建成功，使用套餐抵扣",
  "data": {
    "orderId": 10001,
    "orderNo": "PO202401311234567890",
    "domainId": 1,
    "domainName": "example.com",
    "websiteName": "我的博客",
    "hostname": "www",
    "fullHostname": "www.example.com",
    "recordType": "A",
    "recordValue": "192.168.1.1",
    "ttl": 600,
    "price": 0.00,
    "deductPackage": true,
    "deductedPackageId": 1,
    "status": "reviewing",
    "remark": "个人博客网站",
    "createdAt": "2024-01-31T10:30:00.000Z"
  }
}
```

**响应示例（需要支付）**:
```json
{
  "code": 0,
  "message": "订单创建成功，请完成支付",
  "data": {
    "orderId": 10002,
    "orderNo": "PO202401311234567891",
    "domainId": 1,
    "domainName": "example.com",
    "websiteName": "我的博客",
    "hostname": "www",
    "fullHostname": "www.example.com",
    "recordType": "A",
    "recordValue": "192.168.1.1",
    "ttl": 600,
    "price": 9.90,
    "deductPackage": false,
    "status": "pending",
    "remark": "个人博客网站",
    "expiresAt": "2024-01-31T11:00:00.000Z",
    "createdAt": "2024-01-31T10:30:00.000Z"
  }
}
```

---

### 6. 获取可用支付方式

获取系统支持的支付方式列表

- **接口地址**: `GET /api/v1/payment/methods`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "methods": [
      {
        "code": "alipay",
        "name": "支付宝",
        "icon": "https://example.com/icons/alipay.png",
        "enabled": true
      },
      {
        "code": "wechat",
        "name": "微信支付",
        "icon": "https://example.com/icons/wechat.png",
        "enabled": true
      },
      {
        "code": "balance",
        "name": "余额支付",
        "icon": "https://example.com/icons/balance.png",
        "enabled": true,
        "balance": 100.00
      }
    ]
  }
}
```

---

### 7. 支付解析订单

支付待支付的解析订单

- **接口地址**: `POST /api/v1/parse-orders/:orderId/pay`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| orderId | number | 是 | 订单ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| paymentMethod | string | 是 | 支付方式：alipay/wechat/balance |

**请求示例**:
```json
{
  "paymentMethod": "alipay"
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "支付请求创建成功",
  "data": {
    "orderId": 10002,
    "orderNo": "PO202401311234567891",
    "paymentMethod": "alipay",
    "paymentUrl": "https://openapi.alipay.com/gateway.do?...",
    "qrCode": "https://qr.alipay.com/xxx",
    "amount": 9.90,
    "expiresAt": "2024-01-31T11:00:00.000Z"
  }
}
```

---

### 8. 获取解析订单列表

获取当前用户的解析订单列表

- **接口地址**: `GET /api/v1/parse-orders`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| status | string | 否 | 状态筛选 | - |

**状态说明**:
- `pending` - 待支付
- `paid` - 已支付（等待审核）
- `reviewing` - 审核中
- `active` - 已通过（解析已生效）
- `rejected` - 已拒绝
- `cancelled` - 已取消
- `expired` - 已过期

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "orderId": 10001,
        "orderNo": "PO202401311234567890",
        "domainName": "example.com",
        "websiteName": "我的博客",
        "hostname": "www",
        "fullHostname": "www.example.com",
        "recordType": "A",
        "recordValue": "192.168.1.1",
        "price": 0.00,
        "status": "reviewing",
        "deductPackage": true,
        "createdAt": "2024-01-31T10:30:00.000Z"
      },
      {
        "orderId": 10002,
        "orderNo": "PO202401311234567891",
        "domainName": "example.com",
        "websiteName": "测试站点",
        "hostname": "test",
        "fullHostname": "test.example.com",
        "recordType": "CNAME",
        "recordValue": "example.github.io",
        "price": 9.90,
        "status": "active",
        "deductPackage": false,
        "paymentMethod": "alipay",
        "paymentTime": "2024-01-31T10:35:00.000Z",
        "createdAt": "2024-01-31T10:30:00.000Z"
      }
    ],
    "total": 2,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 9. 获取解析订单详情

获取指定解析订单的详细信息

- **接口地址**: `GET /api/v1/parse-orders/:orderId`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "orderId": 10001,
    "orderNo": "PO202401311234567890",
    "domainId": 1,
    "domainName": "example.com",
    "websiteName": "我的博客",
    "hostname": "www",
    "fullHostname": "www.example.com",
    "recordType": "A",
    "recordValue": "192.168.1.1",
    "ttl": 600,
    "price": 0.00,
    "deductPackage": true,
    "deductedPackageId": 1,
    "deductedPackageName": "基础套餐",
    "status": "active",
    "remark": "个人博客网站",
    "reviewRemark": "审核通过",
    "reviewedAt": "2024-01-31T11:00:00.000Z",
    "cloudRecordId": "cloud_123456",
    "createdAt": "2024-01-31T10:30:00.000Z",
    "updatedAt": "2024-01-31T11:00:00.000Z"
  }
}
```

---

## 第二部分：用户购买套餐流程

### 流程概述
```
选择域名 → 选择套餐 → 创建订单 → 支付 → 套餐生效（获得解析次数）
```

---

### 1. 获取域名下的套餐列表

获取指定域名下的所有可用套餐

- **接口地址**: `GET /api/v1/domains/:domainId/packages`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| domainId | number | 是 | 域名ID |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "domainId": 1,
    "domainName": "example.com",
    "packages": [
      {
        "id": 1,
        "name": "基础套餐",
        "description": "适合个人用户",
        "parseCount": 10,
        "durationDays": 30,
        "price": 29.90,
        "originalPrice": 59.90,
        "isActive": true
      },
      {
        "id": 2,
        "name": "标准套餐",
        "description": "适合小型团队",
        "parseCount": 50,
        "durationDays": 90,
        "price": 99.90,
        "originalPrice": 199.90,
        "isActive": true
      },
      {
        "id": 3,
        "name": "高级套餐",
        "description": "适合企业用户",
        "parseCount": 200,
        "durationDays": 365,
        "price": 299.90,
        "originalPrice": 599.90,
        "isActive": true
      }
    ]
  }
}
```

---

### 2. 创建套餐订单

用户选择套餐后创建购买订单

- **接口地址**: `POST /api/v1/package-orders`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| domainId | number | 是 | 域名ID |
| packageId | number | 是 | 套餐ID |

**请求示例**:
```json
{
  "domainId": 1,
  "packageId": 2
}
```

**响应示例**:
```json
{
  "code": 0,
  "message": "套餐订单创建成功",
  "data": {
    "orderId": 20001,
    "orderNo": "PKO202401311234567890",
    "domainId": 1,
    "domainName": "example.com",
    "packageId": 2,
    "packageName": "标准套餐",
    "parseCount": 50,
    "durationDays": 90,
    "price": 99.90,
    "status": "pending",
    "validStart": null,
    "validEnd": null,
    "expiresAt": "2024-01-31T11:00:00.000Z",
    "createdAt": "2024-01-31T10:30:00.000Z"
  }
}
```

---

### 3. 支付套餐订单

支付套餐购买订单

- **接口地址**: `POST /api/v1/package-orders/:orderId/pay`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| orderId | number | 是 | 订单ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| paymentMethod | string | 是 | 支付方式：alipay/wechat/balance |

**响应示例**:
```json
{
  "code": 0,
  "message": "支付请求创建成功",
  "data": {
    "orderId": 20001,
    "orderNo": "PKO202401311234567890",
    "paymentMethod": "wechat",
    "paymentUrl": "weixin://wxpay/...",
    "qrCode": "https://api.example.com/qrcode/xxx",
    "amount": 99.90,
    "expiresAt": "2024-01-31T11:00:00.000Z"
  }
}
```

---

### 4. 获取套餐订单列表

获取当前用户的套餐购买订单列表

- **接口地址**: `GET /api/v1/package-orders`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| status | string | 否 | 状态筛选 | - |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "orderId": 20001,
        "orderNo": "PKO202401311234567890",
        "domainName": "example.com",
        "packageName": "标准套餐",
        "parseCount": 50,
        "durationDays": 90,
        "price": 99.90,
        "status": "paid",
        "paymentMethod": "wechat",
        "paymentTime": "2024-01-31T10:35:00.000Z",
        "validStart": "2024-01-31T10:35:00.000Z",
        "validEnd": "2024-04-30T10:35:00.000Z",
        "createdAt": "2024-01-31T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

### 5. 获取我的套餐列表

获取当前用户已购买且有效的套餐列表

- **接口地址**: `GET /api/v1/user/packages`
- **是否需要认证**: 是
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 10 |
| status | string | 否 | 状态筛选(active/expired) | - |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "domainId": 1,
        "domainName": "example.com",
        "packageId": 2,
        "packageName": "标准套餐",
        "totalCount": 50,
        "usedCount": 5,
        "availableCount": 45,
        "validStart": "2024-01-31T10:35:00.000Z",
        "validEnd": "2024-04-30T10:35:00.000Z",
        "status": "active",
        "daysRemaining": 89
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10
  }
}
```

---

## 第三部分：管理员接口

### 1. 获取解析订单列表（管理员）

管理员查看所有解析订单，支持审核操作

- **接口地址**: `GET /api/v1/admin/parse-orders`
- **是否需要认证**: 是（需管理员权限）
- **请求头**: `Authorization: Bearer <token>`

**查询参数**:

| 参数名 | 类型 | 必填 | 描述 | 默认值 |
|--------|------|------|------|--------|
| page | number | 否 | 页码 | 1 |
| pageSize | number | 否 | 每页数量 | 20 |
| status | string | 否 | 状态筛选 | - |
| domainId | number | 否 | 域名ID筛选 | - |
| userId | number | 否 | 用户ID筛选 | - |

**响应示例**:
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "list": [
      {
        "orderId": 10001,
        "orderNo": "PO202401311234567890",
        "userId": 1001,
        "username": "testuser",
        "email": "test@example.com",
        "domainName": "example.com",
        "websiteName": "我的博客",
        "hostname": "www",
        "fullHostname": "www.example.com",
        "recordType": "A",
        "recordValue": "192.168.1.1",
        "ttl": 600,
        "price": 0.00,
        "status": "reviewing",
        "deductPackage": true,
        "createdAt": "2024-01-31T10:30:00.000Z"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### 2. 审核解析订单

管理员审核解析订单，通过后自动添加到云平台

- **接口地址**: `POST /api/v1/admin/parse-orders/:orderId/review`
- **是否需要认证**: 是（需管理员权限）
- **请求头**: `Authorization: Bearer <token>`

**路径参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| orderId | number | 是 | 订单ID |

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| approved | boolean | 是 | 是否通过(true/false) |
| reviewRemark | string | 条件必填 | 审核备注，拒绝时必填 |

**请求示例（通过）**:
```json
{
  "approved": true,
  "reviewRemark": "审核通过"
}
```

**请求示例（拒绝）**:
```json
{
  "approved": false,
  "reviewRemark": "解析记录值格式不正确"
}
```

**响应示例（通过）**:
```json
{
  "code": 0,
  "message": "审核通过，解析记录已添加",
  "data": {
    "orderId": 10001,
    "orderNo": "PO202401311234567890",
    "status": "active",
    "reviewRemark": "审核通过",
    "reviewedAt": "2024-01-31T11:00:00.000Z",
    "cloudRecordId": "cloud_123456",
    "emailSent": true
  }
}
```

**响应示例（拒绝）**:
```json
{
  "code": 0,
  "message": "审核已拒绝",
  "data": {
    "orderId": 10001,
    "orderNo": "PO202401311234567890",
    "status": "rejected",
    "reviewRemark": "解析记录值格式不正确",
    "reviewedAt": "2024-01-31T11:00:00.000Z",
    "emailSent": true
  }
}
```

---

### 3. 套餐管理（管理员）

#### 3.1 添加套餐

- **接口地址**: `POST /api/v1/admin/packages`
- **是否需要认证**: 是（需管理员权限）

**请求参数**:

| 参数名 | 类型 | 必填 | 描述 |
|--------|------|------|------|
| domainId | number | 是 | 域名ID |
| name | string | 是 | 套餐名称 |
| description | string | 否 | 套餐描述 |
| parseCount | number | 是 | 解析次数 |
| durationDays | number | 是 | 有效天数 |
| price | number | 是 | 价格 |
| originalPrice | number | 否 | 原价 |
| isActive | boolean | 否 | 是否启用 | true |

**请求示例**:
```json
{
  "domainId": 1,
  "name": "超值套餐",
  "description": "限时优惠",
  "parseCount": 100,
  "durationDays": 180,
  "price": 149.90,
  "originalPrice": 299.90,
  "isActive": true
}
```

---

#### 3.2 更新套餐
已完成
- **接口地址**: `PUT /api/v1/admin/packages/:packageId`
- **是否需要认证**: 是（需管理员权限）

**请求参数**: 同添加套餐（可选）

---

#### 3.3 删除套餐

- **接口地址**: `DELETE /api/v1/admin/packages/:packageId`
- **是否需要认证**: 是（需管理员权限）

---

#### 3.4 获取套餐列表（管理员）

- **接口地址**: `GET /api/v1/admin/packages`
- **是否需要认证**: 是（需管理员权限）

---

## 第四部分：错误码说明

| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权/权限不足 |
| 1003 | Token过期或无效 |
| 1004 | 资源已存在 |
| 1005 | 资源不存在 |
| 2001 | 订单状态错误 |
| 2002 | 需要实名认证 |
| 2003 | 订单已过期 |
| 2004 | 套餐次数不足 |
| 2005 | 无权限操作 |
| 2006 | 解析类型不支持（仅支持A/CNAME/AAAA） |
| 2007 | 主机名格式错误 |
| 2008 | 解析记录值格式错误 |
| 2009 | 主机名已存在 |
| 2010 | 用户未实名认证 |
| 2011 | 订单状态不允许此操作 |
| 2012 | 审核备注不能为空 |
| 3001 | 支付失败 |
| 3002 | 支付金额不匹配 |
| 3003 | 支付配置不存在 |
| 5000 | 服务器内部错误 |

---

## 第五部分：业务流程图

### 用户添加解析流程
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  选择域名    │ → │ 检查实名状态 │ → │ 填写解析信息 │
└─────────────┘    └─────────────┘    └─────────────┘
                                              ↓
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  解析生效    │ ← │  管理员审核  │ ← │  支付订单    │
│ (添加到云平台)│    │             │    │ (如需要)     │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 用户购买套餐流程
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  选择域名    │ → │  选择套餐    │ → │  创建订单    │
└─────────────┘    └─────────────┘    └─────────────┘
                                              ↓
┌─────────────┐    ┌─────────────┐
│  套餐生效    │ ← │  完成支付    │
│(获得解析次数)│    │             │
└─────────────┘    └─────────────┘
```

---

**文档版本**: V1.0
**创建日期**: 2024-01-31
**更新日期**: 2024-01-31
