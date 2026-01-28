# API 文档更新指南

## 更新日期
2026-01-25

## 需要更新的 API 位置

### 1. 获取域名列表（本地数据库）
**API**: GET /api/v1/admin/domains
**位置**: api文档.md 第1528-1606行

**当前状态**: ✅ 已更新（响应数据中已包含 price 和 requireIcp 字段）

**检查事项**:
- ✅ 响应数据已包含 price 字段
- ✅ 响应数据已包含 requireIcp 字段

---

### 2. 添加域名
**API**: POST /api/v1/admin/domains
**位置**: api文档.md 第1610-1665行

**当前状态**: ⚠️ 需要手动更新

**需要更新的内容**:

#### A. 请求参数表格（第1626-1631行）

**当前内容**:
```markdown
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domain | string | 是 | 域名（如: example.com） |
| platformId | number | 是 | 云平台配置ID |
| remarks | string | 否 | 备注说明 |
| isPublic | boolean | 否 | 是否公开（允许用户注册），默认 true |
```

**需要修改为**:
```markdown
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| domain | string | 是 | 域名（如: example.com） |
| platformId | number | 是 | 云平台配置ID |
| price | number | 否 | 域名使用价格（元），默认 0.00 |
| requireIcp | boolean | 否 | 是否需要备案，默认 false |
| remarks | string | 否 | 备注说明 |
| isPublic | boolean | 否 | 是否公开（允许用户注册），默认 true |
```

#### B. 请求示例（第1633-1640行）

**当前内容**:
```json
{
  "domain": "example.com",
  "platformId": 3,
  "remarks": "我的主域名",
  "isPublic": true
}
```

**需要修改为**:
```json
{
  "domain": "example.com",
  "platformId": 3,
  "price": 30.00,
  "requireIcp": false,
  "remarks": "我的主域名",
  "isPublic": true
}
```

#### C. 响应示例（第1648-1662行）

**当前内容**:
```json
{
  "code": 0,
  "message": "域名添加成功",
  "data": {
    "id": 1,
    "domain": "example.com",
    "platformId": 3,
    "isActive": true,
    "isPublic": true,
    "remarks": "我的主域名",
    "createdAt": "2024-01-17T10:00:00.000Z",
    "updatedAt": "2024-01-17T10:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

**需要修改为**:
```json
{
  "code": 0,
  "message": "域名添加成功",
  "data": {
    "id": 1,
    "domain": "example.com",
    "platformId": 3,
    "price": 30.00,
    "requireIcp": false,
    "isActive": true,
    "isPublic": true,
    "remarks": "我的主域名",
    "createdAt": "2024-01-17T10:00:00.000Z",
    "updatedAt": "2024-01-17T10:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

#### D. 注意事项（第1643-1646行）

**当前内容**:
```markdown
- 域名必须已存在于对应的云平台配置中
- 同一个域名不能重复添加到不同的平台配置
- 添加成功后，该域名将可以用于二级域名分发
```

**需要修改为**:
```markdown
- 域名必须已存在于对应的云平台配置中
- 同一个域名不能重复添加到不同的平台配置
- 添加成功后，该域名将可以用于二级域名分发
- price 字段用于设置域名的使用价格
- requireIcp 字段用于设置是否需要备案
```

---

### 3. 修改域名配置
**API**: PUT /api/v1/admin/domains/:domainId
**位置**: api文档.md 第1695-1775行

**当前状态**: ⚠️ 需要手动更新

**需要更新的内容**:

#### A. 请求参数表格（第1719-1724行）

**当前内容**:
```markdown
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| platformId | number | 否 | 云平台配置ID |
| remarks | string | 否 | 备注说明 |
| isPublic | boolean | 否 | 是否公开（允许用户注册） |
| isActive | boolean | 否 | 是否启用 |
```

**需要修改为**:
```markdown
| 参数名 | 类型 | 必填 | 描述 |
| :--- | :--- | :--- | :--- |
| platformId | number | 否 | 云平台配置ID |
| price | number | 否 | 域名使用价格（元） |
| requireIcp | boolean | 否 | 是否需要备案 |
| remarks | string | 否 | 备注说明 |
| isPublic | boolean | 否 | 是否公开（允许用户注册） |
| isActive | boolean | 否 | 是否启用 |
```

#### B. 请求示例（第1726-1732行）

**当前内容**:
```json
PUT /api/v1/admin/domains/1
{
  "platformId": 2,
  "remarks": "更新后的备注",
  "isPublic": false,
  "isActive": true
}
```

**需要修改为**:
```json
PUT /api/v1/admin/domains/1
{
  "platformId": 2,
  "price": 50.00,
  "requireIcp": true,
  "remarks": "更新后的备注",
  "isPublic": false,
  "isActive": true
}
```

#### C. 响应示例（第1740-1760行）

**当前内容**:
```json
{
  "code": 0,
  "message": "修改成功",
  "data": {
    "id": 1,
    "domain": "example.com",
    "platformId": 2,
    "platformName": "腾讯云配置",
    "platform": "tencent",
    "isActive": true,
    "isPublic": false,
    "remarks": "更新后的备注",
    "createdAt": "2024-01-17T10:00:00.000Z",
    "updatedAt": "2024-01-17T11:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

**需要修改为**:
```json
{
  "code": 0,
  "message": "修改成功",
  "data": {
    "id": 1,
    "domain": "example.com",
    "platformId": 2,
    "platformName": "腾讯云配置",
    "platform": "tencent",
    "price": 50.00,
    "requireIcp": true,
    "isActive": true,
    "isPublic": false,
    "remarks": "更新后的备注",
    "createdAt": "2024-01-17T10:00:00.000Z",
    "updatedAt": "2024-01-17T11:00:00.000Z"
  },
  "timestamp": 1698765432000
}
```

#### D. 注意事项（第1732-1734行）

**当前内容**:
```markdown
- 所有参数都是可选的，只传递需要修改的字段
- 修改平台ID时会验证平台配置是否存在
- 域名本身不能修改，如需更换域名请删除后重新添加
```

**需要修改为**:
```markdown
- 所有参数都是可选的，只传递需要修改的字段
- 修改平台ID时会验证平台配置是否存在
- 域名本身不能修改，如需更换域名请删除后重新添加
- price 字段可以修改域名价格
- requireIcp 字段可以修改备案要求
```

---

## 字段说明

### price（域名价格）
- **类型**: number
- **必填**: 否
- **默认值**: 0.00
- **单位**: 元
- **说明**: 设置域名使用价格，用于计费系统

### requireIcp（是否需要备案）
- **类型**: boolean
- **必填**: 否
- **默认值**: false
- **说明**: 设置是否需要ICP备案
  - true: 需要备案
  - false: 不需要备案

---

## 更新总结

### 后端控制器状态
✅ `getDomainList` - 已添加 price 和 requireIcp 字段
✅ `addDomain` - 已添加 price 和 requireIcp 字段  
✅ `updateDomain` - 已添加 price 和 requireIcp 字段

### API 文档状态
✅ 获取域名列表 - 响应数据已包含 price 和 requireIcp
⚠️ 添加域名 - 需要手动更新请求参数和响应示例
⚠️ 修改域名配置 - 需要手动更新请求参数和响应示例

### 建议
由于文件被频繁修改导致自动更新失败，建议手动按照本指南进行更新。所有新增字段都是可选的，不影响现有功能。
