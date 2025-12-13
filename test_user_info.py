import requests
import json

# 配置API地址
BASE_URL = 'http://localhost:8000/api'

# 测试数据
login_data = {
    "email": "123@123.com",
    "password": "12345678"
}

def test_get_current_user():
    """测试获取当前用户信息"""
    print("测试获取当前用户信息...")
    
    # 先登录获取token
    login_url = f'{BASE_URL}/auth/login'
    response = requests.post(login_url, json=login_data)
    print(f"登录响应状态码: {response.status_code}")
    
    if response.status_code != 200:
        print(f"登录失败: {response.text}")
        return False
    
    login_result = response.json()
    print(f"登录结果: {json.dumps(login_result, indent=2, ensure_ascii=False)}")
    
    if not login_result.get('success'):
        print(f"登录失败: {login_result.get('message')}")
        return False
    
    # 获取token
    access_token = login_result['data']['token']['access']
    print(f"获取到的token: {access_token}")
    
    # 测试获取当前用户信息
    user_url = f'{BASE_URL}/auth/me'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(user_url, headers=headers)
    print(f"获取用户信息响应状态码: {response.status_code}")
    print(f"获取用户信息响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    if response.status_code == 200 and response.json().get('success'):
        print("✅ 测试通过: 成功获取当前用户信息")
        return True
    else:
        print("❌ 测试失败: 获取当前用户信息失败")
        return False

def test_get_user_posts():
    """测试获取用户帖子列表"""
    print("\n测试获取用户帖子列表...")
    
    # 先登录获取token和用户ID
    login_url = f'{BASE_URL}/auth/login'
    response = requests.post(login_url, json=login_data)
    
    if response.status_code != 200:
        print(f"登录失败: {response.text}")
        return False
    
    login_result = response.json()
    user_id = login_result['data']['user']['id']
    access_token = login_result['data']['token']['access']
    
    # 测试获取用户帖子
    posts_url = f'{BASE_URL}/users/{user_id}/posts'
    headers = {
        'Authorization': f'Bearer {access_token}'
    }
    
    response = requests.get(posts_url, headers=headers)
    print(f"获取用户帖子响应状态码: {response.status_code}")
    print(f"获取用户帖子响应: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
    
    if response.status_code == 200 and response.json().get('success'):
        print("✅ 测试通过: 成功获取用户帖子列表")
        return True
    else:
        print("❌ 测试失败: 获取用户帖子列表失败")
        return False

if __name__ == "__main__":
    print("=== 测试用户信息相关API ===")
    test_get_current_user()
    test_get_user_posts()
