# 账号注册模板
test@campus.edu.cn
## 注册说明
1. 注册需要使用学校邮箱（必须以 `.edu.cn` 结尾）
2. 密码长度至少6个字符
3. 注册成功后会自动生成 JWT 令牌

## 注册字段模板

| 字段名 | 类型 | 必填 | 说明 | 示例值 |
|-------|------|------|------|--------|
| username | 字符串 | 是 | 用户名，唯一 | student_123 |
| email | 字符串 | 是 | 学校邮箱，唯一 | student123@example.edu.cn |
| password | 字符串 | 是 | 密码，至少6个字符 | your_password_123 |
| avatar | 字符串 | 否 | 头像URL | https://example.com/avatar.jpg |
| bio | 字符串 | 否 | 个人简介，最多500字符 | 这是我的个人简介 |

## 注册请求示例（JSON格式）
```json
{
  "username": "student_123",
  "email": "student123@example.edu.cn",
  "password": "your_password_123",
  "bio": "这是我的个人简介"
}
```

## 角色说明
注册成功后，默认角色为普通学生用户（student）。如需其他角色，请联系管理员。

- student：普通学生用户
- merchant：商户/广告用户
- moderator：板块版主
- admin：内容管理员
- superAdmin：超级管理员

## 注册接口
- 方法：POST
- URL：`/api/accounts/register/`
- 响应：注册成功后返回用户信息和JWT令牌

## 登录接口
- 方法：POST
- URL：`/api/accounts/login/`
- 请求体：
```json
{
  "email": "student123@example.edu.cn",
  "password": "your_password_123"
}
```

## 测试账号（可选）
如果需要测试账号，可以使用以下命令生成：
```bash
python manage.py generate_test_accounts
```

生成的测试账号密码均为：`123456`
