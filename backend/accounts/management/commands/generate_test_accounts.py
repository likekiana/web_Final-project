#!/usr/bin/env python3
# 生成测试账号脚本

from django.core.management.base import BaseCommand
from accounts.models import User
from django.contrib.auth.hashers import make_password

class Command(BaseCommand):
    help = 'Generate test accounts for different roles'
    
    def handle(self, *args, **options):
        # 预定义测试账号数据
        test_accounts = [
            # 超级管理员
            {
                'username': 'superadmin',
                'email': 'superadmin@example.com',
                'password': '123456',
                'role': 'superAdmin',
                'bio': '超级管理员账号'
            },
            # 管理员
            {
                'username': 'admin',
                'email': 'admin@example.com',
                'password': '123456',
                'role': 'admin',
                'bio': '管理员账号'
            },
            # 版主
            {
                'username': 'moderator',
                'email': 'moderator@example.com',
                'password': '123456',
                'role': 'moderator',
                'bio': '版主账号'
            },
            # 普通学生用户
            {
                'username': 'student1',
                'email': 'student1@example.com',
                'password': '123456',
                'role': 'student',
                'bio': '普通学生用户1'
            },
            {
                'username': 'student2',
                'email': 'student2@example.com',
                'password': '123456',
                'role': 'student',
                'bio': '普通学生用户2'
            },
            # 商户用户
            {
                'username': 'merchant',
                'email': 'merchant@example.com',
                'password': '123456',
                'role': 'merchant',
                'bio': '商户用户账号'
            }
        ]
        
        # 创建测试账号
        created_count = 0
        for account_data in test_accounts:
            # 检查账号是否已存在
            if not User.objects.filter(email=account_data['email']).exists():
                # 哈希密码
                account_data['password'] = make_password(account_data['password'])
                
                # 创建用户
                user = User.objects.create(**account_data)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created test account: {user.username} ({user.role})'))
            else:
                self.stdout.write(self.style.WARNING(f'Account already exists: {account_data["username"]}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nCreated {created_count} new test accounts'))
        self.stdout.write(self.style.INFO(f'Total users: {User.objects.count()}'))
        self.stdout.write(self.style.INFO(f'Test accounts created with password: 123456'))
        
        # 显示所有测试账号
        self.stdout.write(self.style.SUCCESS('\nAll test accounts:'))
        for account in test_accounts:
            self.stdout.write(f'{account["role"]}: {account["email"]} / {account["password"]}')
