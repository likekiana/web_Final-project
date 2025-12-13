import requests
import json

# 配置API地址
BASE_URL = 'http://127.0.0.1:8000/api'

def test_auth_api():
    """测试认证相关API"""
    print("=== 测试认证相关API ===")
    
    # 测试注册
    register_data = {
        "email": "test@example.edu.cn",
        "username": "testuser",
        "password": "123456"
    }
    
    print("1. 测试注册API")
    response = requests.post(f'{BASE_URL}/auth/register', json=register_data)
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    # 测试登录 - 使用新注册的用户
    login_data = {
        "email": "test@example.edu.cn",
        "password": "123456"
    }
    
    print("\n2. 测试登录API")
    response = requests.post(f'{BASE_URL}/auth/login', json=login_data)
    print(f"状态码: {response.status_code}")
    login_result = response.json()
    print(f"响应: {json.dumps(login_result, indent=2, ensure_ascii=False)}")
    
    if login_result.get('success'):
        access_token = login_result['data']['token']['access']
        user_id = login_result['data']['user']['id']
        
        # 测试获取当前用户信息
        print("\n3. 测试获取当前用户信息API")
        headers = {'Authorization': f'Bearer {access_token}'}
        response = requests.get(f'{BASE_URL}/auth/me', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试获取用户信息
        print("\n4. 测试获取用户信息API")
        response = requests.get(f'{BASE_URL}/users/{user_id}')
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试更新用户信息
        print("\n5. 测试更新用户信息API")
        update_data = {
            "username": "updateduser",
            "bio": "这是更新后的个人简介"
        }
        response = requests.put(f'{BASE_URL}/users/{user_id}', json=update_data, headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        return access_token
    
    return None

def test_post_api(access_token):
    """测试帖子相关API"""
    print("\n=== 测试帖子相关API ===")
    
    if not access_token:
        print("需要登录token才能测试帖子相关API")
        return
    
    headers = {'Authorization': f'Bearer {access_token}'}
    
    # 测试获取帖子列表
    print("1. 测试获取帖子列表API")
    response = requests.get(f'{BASE_URL}/posts')
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    # 测试获取板块列表
    print("\n2. 测试获取板块列表API")
    response = requests.get(f'{BASE_URL}/categories')
    print(f"状态码: {response.status_code}")
    print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    # 获取第一个板块ID，用于创建帖子测试
    categories = response.json().get('data', [])
    category_id = categories[0]['id'] if categories else 1
    
    # 测试创建帖子
    print("\n3. 测试创建帖子API")
    post_data = {
        "title": "测试帖子",
        "content": "这是一个测试帖子",
        "categoryId": category_id,
        "type": "normal"
    }
    response = requests.post(f'{BASE_URL}/posts', json=post_data, headers=headers)
    print(f"状态码: {response.status_code}")
    post_result = response.json()
    print(f"响应: {json.dumps(post_result, indent=2, ensure_ascii=False)}")
    
    if post_result.get('success'):
        post_id = post_result['data']['id']
        
        # 测试获取帖子详情
        print("\n4. 测试获取帖子详情API")
        response = requests.get(f'{BASE_URL}/posts/{post_id}')
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试点赞帖子
        print("\n5. 测试点赞帖子API")
        response = requests.post(f'{BASE_URL}/posts/{post_id}/like', headers=headers)
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试获取评论列表
        print("\n6. 测试获取评论列表API")
        response = requests.get(f'{BASE_URL}/posts/{post_id}/comments')
        print(f"状态码: {response.status_code}")
        print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        
        # 测试创建评论
        print("\n7. 测试创建评论API")
        comment_data = {
            "content": "这是一条测试评论"
        }
        response = requests.post(f'{BASE_URL}/posts/{post_id}/comments', json=comment_data, headers=headers)
        print(f"状态码: {response.status_code}")
        comment_result = response.json()
        print(f"响应: {json.dumps(comment_result, indent=2, ensure_ascii=False)}")
        
        if comment_result.get('success'):
            comment_id = comment_result['data']['id']
            
            # 测试点赞评论
            print("\n8. 测试点赞评论API")
            response = requests.post(f'{BASE_URL}/posts/{post_id}/comments/{comment_id}/like', headers=headers)
            print(f"状态码: {response.status_code}")
            print(f"响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")

if __name__ == "__main__":
    # 测试认证API，获取token
    token = test_auth_api()
    
    # 测试帖子相关API
    test_post_api(token)
