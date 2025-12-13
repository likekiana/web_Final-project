import requests
import json

# 配置API地址
BASE_URL = 'http://127.0.0.1:8000/api'

# 登录获取token
login_data = {
    "email": "test@example.edu.cn",
    "password": "123456"
}

print("=== 测试发帖功能 ===")
print("1. 登录获取token")
login_response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
print(f"状态码: {login_response.status_code}")

if login_response.status_code == 200:
    login_result = login_response.json()
    if login_result.get('success'):
        access_token = login_result['data']['token']['access']
        headers = {'Authorization': f'Bearer {access_token}'}
        
        # 创建板块
        print("\n2. 创建测试板块")
        category_data = {
            "name": "测试板块",
            "description": "这是一个测试板块",
            "icon": "BookOutlined",
            "color": "#1890ff",
            "order": 1
        }
        category_response = requests.post(f'{BASE_URL}/categories', json=category_data, headers=headers)
        print(f"状态码: {category_response.status_code}")
        print(f"响应: {json.dumps(category_response.json(), indent=2, ensure_ascii=False)}")
        
        if category_response.status_code == 201:
            category_result = category_response.json()
            category_id = category_result['data']['id']
            
            # 测试发帖
            print("\n3. 测试发帖功能")
            post_data = {
                "title": "测试帖子",
                "content": "这是一个测试帖子，用于测试发帖功能是否正常工作。",
                "category_id": category_id,
                "type": "normal"
            }
            
            post_response = requests.post(f'{BASE_URL}/posts', json=post_data, headers=headers)
            print(f"状态码: {post_response.status_code}")
            print(f"响应: {json.dumps(post_response.json(), indent=2, ensure_ascii=False)}")
            
            if post_response.status_code == 201:
                print("\n✅ 测试成功: 发帖功能正常工作")
            else:
                print("\n❌ 测试失败: 发帖功能无法正常工作")
        else:
            print("\n❌ 测试失败: 无法创建测试板块")
    else:
        print("\n❌ 测试失败: 登录失败")
else:
    print("\n❌ 测试失败: 登录请求失败")
