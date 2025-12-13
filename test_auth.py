#!/usr/bin/env python3
"""
测试登录和获取用户信息API
"""

import requests
import json

# API基础URL
BASE_URL = 'http://localhost:8000/api'

# 测试登录
print("=== 测试登录 API ===")
login_url = f'{BASE_URL}/auth/login'
login_data = {
    "email": "test@campus.edu.cn",
    "password": "123456"
}

try:
    response = requests.post(login_url, json=login_data)
    response.raise_for_status()
    login_result = response.json()
    print(f"登录状态: {'成功' if login_result['success'] else '失败'}")
    
    if login_result['success']:
        # 获取访问令牌
        access_token = login_result['data']['token']['access']
        print(f"获取到的访问令牌: {access_token}")
        
        # 测试获取用户信息
        print("\n=== 测试获取用户信息 API ===")
        user_info_url = f'{BASE_URL}/auth/me'
        headers = {
            'Authorization': f'Bearer {access_token}'
        }
        
        user_response = requests.get(user_info_url, headers=headers)
        user_response.raise_for_status()
        user_info = user_response.json()
        print(f"获取用户信息状态: {'成功' if user_info['success'] else '失败'}")
        
        if user_info['success']:
            print(f"用户信息: {json.dumps(user_info['data'], indent=2, ensure_ascii=False)}")
        else:
            print(f"错误信息: {user_info.get('message', '未知错误')}")
    else:
        print(f"登录失败原因: {login_result.get('message', '未知错误')}")
        
except requests.exceptions.RequestException as e:
    print(f"请求错误: {e}")
    import traceback
    traceback.print_exc()
except json.JSONDecodeError as e:
    print(f"JSON解析错误: {e}")
except Exception as e:
    print(f"其他错误: {e}")
    import traceback
    traceback.print_exc()
