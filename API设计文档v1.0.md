# 校园信息聚合论坛系统（校园通）API设计文档v1.0

## 1. API概述

### 1.1 设计原则
- 采用RESTful API设计风格
- 统一的API前缀：`/api`
- 统一的响应格式
- 基于JWT的认证机制
- 清晰的资源层级结构
- 适当的错误处理

### 1.2 认证方式
- 使用JSON Web Token (JWT)进行认证
- 登录成功后返回JWT令牌
- 后续请求需要在请求头中添加 `Authorization: Bearer <token>`
- 令牌有效期：7天

### 1.3 响应格式

#### 1.3.1 成功响应
```json
{
  "success": true,
  "message": "操作成功",
  "data": {}
}
```

#### 1.3.2 错误响应
```json
{
  "success": false,
  "message": "错误信息",
  "error": {
    "code": 400,
    "details": "详细错误描述"
  }
}
```

### 1.4 错误码

| 错误码 | 描述 |
| --- | --- |
| 200 | 成功 |
| 400 | 请求参数错误 |
| 401 | 未授权 |
| 403 | 禁止访问 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

## 2. API详细设计

### 2.1 认证相关API

#### 2.1.1 用户注册
- **URL**: `/api/auth/register`
- **方法**: `POST`
- **描述**: 用户注册
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | email | string | 是 | 学校邮箱（@xx.edu.cn） |
  | password | string | 是 | 密码（至少6位） |
  | username | string | 是 | 用户名 |
  | role | string | 否 | 角色（默认为student） |

- **响应示例**:
```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@xx.edu.cn",
      "role": "student",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### 2.1.2 用户登录
- **URL**: `/api/auth/login`
- **方法**: `POST`
- **描述**: 用户登录
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | email | string | 是 | 学校邮箱 |
  | password | string | 是 | 密码 |

- **响应示例**:
```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "test@xx.edu.cn",
      "role": "student",
      "createdAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

#### 2.1.3 获取当前用户信息
- **URL**: `/api/auth/me`
- **方法**: `GET`
- **描述**: 获取当前登录用户的信息
- **权限**: 需要认证
- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "test@xx.edu.cn",
    "role": "student",
    "avatar": null,
    "reputation": 100,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

### 2.2 用户相关API

#### 2.2.1 获取用户信息
- **URL**: `/api/users/:id`
- **方法**: `GET`
- **描述**: 获取指定用户的信息
- **权限**: 公开
- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "role": "student",
    "avatar": null,
    "reputation": 100,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2.2.2 更新用户信息
- **URL**: `/api/users/:id`
- **方法**: `PUT`
- **描述**: 更新用户信息
- **权限**: 仅用户本人或管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | username | string | 否 | 用户名 |
  | avatar | file | 否 | 头像文件 |
  | bio | string | 否 | 个人简介 |

- **响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "username": "newusername",
    "avatar": "uploads/avatar123.jpg",
    "bio": "这是我的个人简介",
    "reputation": 100,
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2.2.3 获取用户发帖历史
- **URL**: `/api/users/:id/posts`
- **方法**: `GET`
- **描述**: 获取用户的发帖历史
- **权限**: 公开
- **查询参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | page | number | 否 | 页码（默认1） |
  | limit | number | 否 | 每页数量（默认10） |

- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "测试帖子",
        "content": "帖子内容",
        "categoryId": 1,
        "categoryName": "学习学术区",
        "likesCount": 5,
        "commentsCount": 2,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "pageSize": 10
    }
  }
}
```

### 2.3 板块相关API

#### 2.3.1 获取所有板块
- **URL**: `/api/categories`
- **方法**: `GET`
- **描述**: 获取所有板块列表
- **权限**: 公开
- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": [
    {
      "id": 1,
      "name": "学习学术区",
      "description": "学习资料共享、考研/保研信息、学习经验交流、学术问题讨论",
      "icon": "book",
      "color": "#1890ff",
      "postCount": 100,
      "order": 1
    },
    {
      "id": 2,
      "name": "校园生活区",
      "description": "生活攻略、失物招领、校内资讯、生活问答",
      "icon": "home",
      "color": "#52c41a",
      "postCount": 200,
      "order": 2
    }
  ]
}
```

#### 2.3.2 创建板块
- **URL**: `/api/categories`
- **方法**: `POST`
- **描述**: 创建新板块
- **权限**: 管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | name | string | 是 | 板块名称 |
  | description | string | 是 | 板块描述 |
  | icon | string | 否 | 板块图标 |
  | color | string | 否 | 板块颜色 |
  | order | number | 否 | 排序顺序 |

- **响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 8,
    "name": "新板块",
    "description": "新板块描述",
    "icon": "new",
    "color": "#ff0000",
    "postCount": 0,
    "order": 8
  }
}
```

#### 2.3.3 获取板块详情
- **URL**: `/api/categories/:id`
- **方法**: `GET`
- **描述**: 获取指定板块的详情
- **权限**: 公开
- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "name": "学习学术区",
    "description": "学习资料共享、考研/保研信息、学习经验交流、学术问题讨论",
    "icon": "book",
    "color": "#1890ff",
    "postCount": 100,
    "order": 1
  }
}
```

#### 2.3.4 更新板块
- **URL**: `/api/categories/:id`
- **方法**: `PUT`
- **描述**: 更新板块信息
- **权限**: 管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | name | string | 否 | 板块名称 |
  | description | string | 否 | 板块描述 |
  | icon | string | 否 | 板块图标 |
  | color | string | 否 | 板块颜色 |
  | order | number | 否 | 排序顺序 |

- **响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "name": "更新后的板块",
    "description": "更新后的描述",
    "icon": "updated",
    "color": "#0000ff",
    "postCount": 100,
    "order": 1
  }
}
```

#### 2.3.5 删除板块
- **URL**: `/api/categories/:id`
- **方法**: `DELETE`
- **描述**: 删除板块
- **权限**: 管理员
- **响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": null
}
```

### 2.4 帖子相关API

#### 2.4.1 获取帖子列表
- **URL**: `/api/posts`
- **方法**: `GET`
- **描述**: 获取帖子列表，支持搜索和筛选
- **权限**: 公开
- **查询参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | page | number | 否 | 页码（默认1） |
  | limit | number | 否 | 每页数量（默认10） |
  | categoryId | number | 否 | 板块ID |
  | keyword | string | 否 | 搜索关键词 |
  | sortBy | string | 否 | 排序字段（createdAt/likesCount，默认createdAt） |
  | order | string | 否 | 排序顺序（asc/desc，默认desc） |

- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "posts": [
      {
        "id": 1,
        "title": "测试帖子",
        "content": "帖子内容",
        "categoryId": 1,
        "categoryName": "学习学术区",
        "userId": 1,
        "username": "testuser",
        "avatar": null,
        "likesCount": 5,
        "commentsCount": 2,
        "isLiked": false,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 10,
      "totalItems": 100,
      "pageSize": 10
    }
  }
}
```

#### 2.4.2 创建帖子
- **URL**: `/api/posts`
- **方法**: `POST`
- **描述**: 创建新帖子
- **权限**: 登录用户
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | title | string | 是 | 帖子标题 |
  | content | string | 是 | 帖子内容（支持富文本） |
  | categoryId | number | 是 | 板块ID |
  | type | string | 否 | 帖子类型（normal/trade/advertisement，默认normal） |
  | images | array | 否 | 图片文件数组 |

- **响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 1,
    "title": "测试帖子",
    "content": "帖子内容",
    "categoryId": 1,
    "categoryName": "学习学术区",
    "type": "normal",
    "images": ["uploads/post123_1.jpg", "uploads/post123_2.jpg"],
    "likesCount": 0,
    "commentsCount": 0,
    "userId": 1,
    "username": "testuser",
    "createdAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2.4.3 获取帖子详情
- **URL**: `/api/posts/:id`
- **方法**: `GET`
- **描述**: 获取帖子详情
- **权限**: 公开
- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "id": 1,
    "title": "测试帖子",
    "content": "帖子内容",
    "categoryId": 1,
    "categoryName": "学习学术区",
    "type": "normal",
    "images": ["uploads/post123_1.jpg"],
    "likesCount": 5,
    "commentsCount": 2,
    "isLiked": true,
    "userId": 1,
    "username": "testuser",
    "avatar": null,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-01T00:00:00.000Z"
  }
}
```

#### 2.4.4 更新帖子
- **URL**: `/api/posts/:id`
- **方法**: `PUT`
- **描述**: 更新帖子内容
- **权限**: 帖子作者或管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | title | string | 否 | 帖子标题 |
  | content | string | 否 | 帖子内容 |
  | images | array | 否 | 图片文件数组（替换现有图片） |

- **响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "title": "更新后的帖子",
    "content": "更新后的内容",
    "categoryId": 1,
    "categoryName": "学习学术区",
    "type": "normal",
    "images": ["uploads/post123_1.jpg"],
    "likesCount": 5,
    "commentsCount": 2,
    "userId": 1,
    "username": "testuser",
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

#### 2.4.5 删除帖子
- **URL**: `/api/posts/:id`
- **方法**: `DELETE`
- **描述**: 删除帖子
- **权限**: 帖子作者或管理员
- **响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": null
}
```

### 2.5 评论相关API

#### 2.5.1 获取帖子评论
- **URL**: `/api/posts/:id/comments`
- **方法**: `GET`
- **描述**: 获取指定帖子的评论列表
- **权限**: 公开
- **查询参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | page | number | 否 | 页码（默认1） |
  | limit | number | 否 | 每页数量（默认10） |

- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "comments": [
      {
        "id": 1,
        "content": "这是一条评论",
        "postId": 1,
        "userId": 2,
        "username": "user2",
        "avatar": null,
        "likesCount": 3,
        "isLiked": false,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalItems": 15,
      "pageSize": 10
    }
  }
}
```

#### 2.5.2 创建评论
- **URL**: `/api/posts/:id/comments`
- **方法**: `POST`
- **描述**: 在指定帖子下创建评论
- **权限**: 登录用户
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | content | string | 是 | 评论内容 |

- **响应示例**:
```json
{
  "success": true,
  "message": "创建成功",
  "data": {
    "id": 2,
    "content": "新评论",
    "postId": 1,
    "userId": 1,
    "username": "testuser",
    "avatar": null,
    "likesCount": 0,
    "isLiked": false,
    "createdAt": "2023-01-02T00:00:00.000Z"
  }
}
```

#### 2.5.3 更新评论
- **URL**: `/api/comments/:id`
- **方法**: `PUT`
- **描述**: 更新评论内容
- **权限**: 评论作者或管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | content | string | 是 | 评论内容 |

- **响应示例**:
```json
{
  "success": true,
  "message": "更新成功",
  "data": {
    "id": 1,
    "content": "更新后的评论",
    "postId": 1,
    "userId": 2,
    "username": "user2",
    "avatar": null,
    "likesCount": 3,
    "isLiked": false,
    "createdAt": "2023-01-01T00:00:00.000Z",
    "updatedAt": "2023-01-02T00:00:00.000Z"
  }
}
```

#### 2.5.4 删除评论
- **URL**: `/api/comments/:id`
- **方法**: `DELETE`
- **描述**: 删除评论
- **权限**: 评论作者或管理员
- **响应示例**:
```json
{
  "success": true,
  "message": "删除成功",
  "data": null
}
```

### 2.6 点赞相关API

#### 2.6.1 点赞帖子
- **URL**: `/api/posts/:id/like`
- **方法**: `POST`
- **描述**: 点赞或取消点赞帖子
- **权限**: 登录用户
- **响应示例**:
```json
{
  "success": true,
  "message": "点赞成功",
  "data": {
    "isLiked": true,
    "likesCount": 6
  }
}
```

#### 2.6.2 点赞评论
- **URL**: `/api/comments/:id/like`
- **方法**: `POST`
- **描述**: 点赞或取消点赞评论
- **权限**: 登录用户
- **响应示例**:
```json
{
  "success": true,
  "message": "点赞成功",
  "data": {
    "isLiked": true,
    "likesCount": 4
  }
}
```

### 2.7 举报相关API

#### 2.7.1 举报帖子
- **URL**: `/api/posts/:id/report`
- **方法**: `POST`
- **描述**: 举报帖子
- **权限**: 登录用户
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | type | string | 是 | 举报类型（spam/pornography/violence/other） |
  | reason | string | 否 | 举报原因 |

- **响应示例**:
```json
{
  "success": true,
  "message": "举报成功，我们将尽快处理",
  "data": null
}
```

#### 2.7.2 举报评论
- **URL**: `/api/comments/:id/report`
- **方法**: `POST`
- **描述**: 举报评论
- **权限**: 登录用户
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | type | string | 是 | 举报类型（spam/pornography/violence/other） |
  | reason | string | 否 | 举报原因 |

- **响应示例**:
```json
{
  "success": true,
  "message": "举报成功，我们将尽快处理",
  "data": null
}
```

### 2.8 管理员相关API

#### 2.8.1 获取用户列表（管理员）
- **URL**: `/api/admin/users`
- **方法**: `GET`
- **描述**: 获取所有用户列表（管理员权限）
- **权限**: 管理员
- **查询参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | page | number | 否 | 页码（默认1） |
  | limit | number | 否 | 每页数量（默认10） |
  | keyword | string | 否 | 搜索关键词（用户名或邮箱） |
  | role | string | 否 | 角色筛选 |
  | status | string | 否 | 状态筛选（active/banned） |

- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "users": [
      {
        "id": 1,
        "username": "testuser",
        "email": "test@xx.edu.cn",
        "role": "student",
        "status": "active",
        "reputation": 100,
        "postCount": 5,
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 20,
      "totalItems": 200,
      "pageSize": 10
    }
  }
}
```

#### 2.8.2 更新用户角色（管理员）
- **URL**: `/api/admin/users/:id/role`
- **方法**: `PUT`
- **描述**: 更新用户角色（管理员权限）
- **权限**: 管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | role | string | 是 | 新角色（student/merchant/moderator/admin/superAdmin） |

- **响应示例**:
```json
{
  "success": true,
  "message": "角色更新成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "role": "moderator"
  }
}
```

#### 2.8.3 封禁/解封用户（管理员）
- **URL**: `/api/admin/users/:id/status`
- **方法**: `PUT`
- **描述**: 封禁或解封用户（管理员权限）
- **权限**: 管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | status | string | 是 | 状态（active/banned） |

- **响应示例**:
```json
{
  "success": true,
  "message": "用户已封禁",
  "data": {
    "id": 1,
    "username": "testuser",
    "status": "banned"
  }
}
```

#### 2.8.4 获取举报列表（管理员）
- **URL**: `/api/admin/reports`
- **方法**: `GET`
- **描述**: 获取举报列表（管理员权限）
- **权限**: 管理员
- **查询参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | page | number | 否 | 页码（默认1） |
  | limit | number | 否 | 每页数量（默认10） |
  | type | string | 否 | 举报类型 |
  | status | string | 否 | 处理状态（pending/processed） |

- **响应示例**:
```json
{
  "success": true,
  "message": "获取成功",
  "data": {
    "reports": [
      {
        "id": 1,
        "type": "spam",
        "reason": "垃圾广告",
        "targetType": "post",
        "targetId": 1,
        "targetTitle": "测试帖子",
        "reporterId": 2,
        "reporterName": "user2",
        "status": "pending",
        "createdAt": "2023-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 50,
      "pageSize": 10
    }
  }
}
```

#### 2.8.5 处理举报（管理员）
- **URL**: `/api/admin/reports/:id`
- **方法**: `PUT`
- **描述**: 处理举报（管理员权限）
- **权限**: 管理员
- **请求参数**:
  | 参数名 | 类型 | 必需 | 描述 |
  | --- | --- | --- | --- |
  | status | string | 是 | 处理状态（processed） |
  | action | string | 是 | 处理动作（ignore/delete/warn） |
  | notes | string | 否 | 处理备注 |

- **响应示例**:
```json
{
  "success": true,
  "message": "举报已处理",
  "data": {
    "id": 1,
    "status": "processed",
    "action": "delete",
    "notes": "已删除违规帖子"
  }
}
```

## 3. API版本控制

- 当前版本：v1
- 版本号通过URL前缀标识：`/api/v1/`
- 后续版本升级将使用新的URL前缀，如：`/api/v2/`
- 旧版本API将在新版本发布后保留6个月，然后逐步废弃

## 4. API安全

### 4.1 认证与授权
- 所有敏感API都需要JWT认证
- 基于角色的访问控制（RBAC）
- 定期更换JWT密钥

### 4.2 输入验证
- 所有API请求参数都需要进行严格验证
- 防止SQL注入、XSS攻击等
- 使用参数化查询

### 4.3 速率限制
- 对API请求进行速率限制
- 防止恶意请求和DDoS攻击
- 不同API设置不同的速率限制

### 4.4 日志记录
- 记录所有API请求日志
- 记录关键操作日志
- 便于审计和问题排查

## 5. API测试

- 使用Postman或Insomnia进行API测试
- 编写单元测试和集成测试
- 测试用例覆盖所有API端点
- 定期进行API性能测试

## 6. 文档更新记录

| 日期 | 版本 | 更新内容 | 作者 |
| --- | --- | --- | --- |
| 2023-01-01 | v1.0 | 初始版本 | 开发团队 |
| 2023-01-15 | v1.1 | 添加举报相关API | 开发团队 |
| 2023-02-01 | v1.2 | 完善管理员API | 开发团队 |

## 7. 附录

### 7.1 数据类型说明

| 类型 | 描述 |
| --- | --- |
| string | 字符串类型 |
| number | 数字类型（整数或浮点数） |
| boolean | 布尔类型（true/false） |
| array | 数组类型 |
| object | 对象类型 |
| file | 文件类型 |

### 7.2 角色说明

| 角色 | 描述 |
| --- | --- |
| student | 普通学生用户 |
| merchant | 商户/广告用户 |
| moderator | 板块版主 |
| admin | 内容管理员 |
| superAdmin | 超级管理员 |

### 7.3 帖子类型说明

| 类型 | 描述 |
| --- | --- |
| normal | 普通帖子 |
| trade | 二手交易帖子 |
| advertisement | 广告帖子 |

### 7.4 举报类型说明

| 类型 | 描述 |
| --- | --- |
| spam | 垃圾广告 |
| pornography | 色情内容 |
| violence | 暴力内容 |
| other | 其他违规内容 |

### 7.5 状态说明

| 状态 | 描述 |
| --- | --- |
| active | 活跃状态 |
| banned | 封禁状态 |
| pending | 待处理 |
| processed | 已处理 |

## 8. 联系方式

如有API相关问题或建议，请联系开发团队：
- 邮箱：dev@campusforum.com
- 文档地址：https://docs.campusforum.com/api
- 变更日志：https://docs.campusforum.com/api/changelog