#!/usr/bin/env python3
"""
测试数据库连接和用户模型
"""

import os
import sys

# 添加Django项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# 设置Django环境变量
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_forum.settings')

# 导入Django并初始化
import django
django.setup()

# 测试数据库连接和用户模型
try:
    from accounts.models import User
    
    # 获取用户数量
    user_count = User.objects.count()
    print(f"当前用户数量: {user_count}")
    
    # 如果有用户，打印第一个用户信息
    if user_count > 0:
        first_user = User.objects.first()
        print(f"第一个用户: {first_user.username} - {first_user.email}")
    
    print("\n数据库连接和用户模型测试成功!")
    sys.exit(0)
except Exception as e:
    print(f"\n测试失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
