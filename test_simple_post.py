import requests
import json

# 测试发帖功能的简单脚本
BASE_URL = 'http://localhost:8000/api'

# 使用已知的token（从之前的请求中获取）
token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzY2MjQ2NzIwLCJpYXQiOjE3NjU2NDE5MjAsImp0aSI6IjAxOTg1YzJjNDBkZTQ0ZjA4MTZhZjJhMTBmY2U0NTA4IiwidXNlcl9pZCI6IjEifQ.qTrVa3uWE0cnBbNlFCOUlZjGrpLjW6kyeBR1-IQEaWE'
headers = {'Authorization': f'Bearer {token}', 'Content-Type': 'application/json'}

print("=== 简单发帖测试 ===")

# 1. 先获取板块列表，确认有可用的板块
print("\n1. 获取板块列表：")
categories_response = requests.get(f'{BASE_URL}/categories/', headers=headers)
print(f"状态码: {categories_response.status_code}")
print(f"响应: {json.dumps(categories_response.json(), indent=2, ensure_ascii=False)}")

if categories_response.status_code == 200:
    categories_data = categories_response.json()
    if categories_data.get('success'):
        categories = categories_data['data']
        if categories:
            # 选择第一个板块
            category_id = categories[0]['id']
            print(f"\n2. 选择板块：ID = {category_id}, 名称 = {categories[0]['name']}")
            
            # 2. 尝试发帖
            print("\n3. 尝试发帖：")
            post_data = {
                "title": "测试帖子标题",
                "content": "这是一个测试帖子的内容，长度足够长以通过验证。",
                "category_id": category_id,
                "type": "normal"
            }
            
            print(f"请求数据: {json.dumps(post_data, indent=2, ensure_ascii=False)}")
            post_response = requests.post(f'{BASE_URL}/posts/', json=post_data, headers=headers)
            print(f"状态码: {post_response.status_code}")
            print(f"响应: {json.dumps(post_response.json(), indent=2, ensure_ascii=False)}")
            
            if post_response.status_code == 201:
                print("\n✅ 测试成功: 帖子创建成功")
            else:
                print("\n❌ 测试失败: 帖子创建失败")
        else:
            print("\n❌ 测试失败: 没有可用的板块")
    else:
        print("\n❌ 测试失败: 获取板块列表失败")
else:
    print("\n❌ 测试失败: 获取板块列表请求失败")
