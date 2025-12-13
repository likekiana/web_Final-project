import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.abspath('backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_forum.settings')

import django
django.setup()

from content.models import Category

print("=== 检查板块数据 ===")
categories = Category.objects.all()
print(f"当前板块数量: {categories.count()}")

for category in categories:
    print(f"板块ID: {category.id}, 名称: {category.name}")

if categories.count() == 0:
    print("\n警告：数据库中没有板块记录！")
    print("请先创建板块，然后再测试发帖功能。")
