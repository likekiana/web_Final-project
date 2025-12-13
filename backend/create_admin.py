#!/usr/bin/env python
"""
创建超级管理员账号脚本
"""

import os
import sys

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# 配置Django环境
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_forum.settings')

import django
django.setup()

from accounts.models import User
from django.contrib.auth.hashers import make_password

def create_super_admin():
    """创建超级管理员账号"""
    
    # 检查是否已存在超级管理员
    existing_admin = User.objects.filter(role='superAdmin').first()
    if existing_admin:
        print(f"超级管理员账号已存在: {existing_admin.email}")
        return
    
    # 创建超级管理员账号
    admin_user = User(
        username='admin',
        email='admin@campus.edu.cn',
        password=make_password('admin123'),
        role='superAdmin',
        is_active=True,
        is_staff=True,
        is_superuser=True,
        reputation=100
    )
    
    admin_user.save()
    print(f"超级管理员账号创建成功:")
    print(f"  用户名: {admin_user.username}")
    print(f"  邮箱: {admin_user.email}")
    print(f"  密码: admin123")
    print(f"  角色: {admin_user.role}")
    print(f"  ID: {admin_user.id}")

if __name__ == "__main__":
    create_super_admin()
