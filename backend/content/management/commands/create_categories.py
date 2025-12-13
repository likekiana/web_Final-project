# 创建板块数据脚本
from django.core.management.base import BaseCommand
from content.models import Category

class Command(BaseCommand):
    help = 'Create initial categories for the forum'
    
    def handle(self, *args, **options):
        # 预定义板块数据
        categories = [
            {
                'name': '校园公告',
                'description': '发布校园相关公告',
                'icon': 'BookOutlined',
                'color': '#1890ff',
                'order': 1
            },
            {
                'name': '二手交易',
                'description': '二手物品交易市场',
                'icon': 'ShoppingCartOutlined',
                'color': '#52c41a',
                'order': 2
            },
            {
                'name': '学习交流',
                'description': '学习经验分享和交流',
                'icon': 'TeamOutlined',
                'color': '#faad14',
                'order': 3
            },
            {
                'name': '休闲娱乐',
                'description': '休闲娱乐话题讨论',
                'icon': 'HeartOutlined',
                'color': '#f5222d',
                'order': 4
            },
            {
                'name': '广告专区',
                'description': '发布各类广告信息',
                'icon': 'FileTextOutlined',
                'color': '#722ed1',
                'order': 5
            }
        ]
        
        # 创建板块
        created_count = 0
        for cat_data in categories:
            # 检查板块是否已存在
            if not Category.objects.filter(name=cat_data['name']).exists():
                Category.objects.create(**cat_data)
                created_count += 1
                self.stdout.write(self.style.SUCCESS(f'Created category: {cat_data["name"]}'))
            else:
                self.stdout.write(self.style.WARNING(f'Category already exists: {cat_data["name"]}'))
        
        self.stdout.write(self.style.SUCCESS(f'\nCreated {created_count} new categories'))
        self.stdout.write(self.style.INFO(f'Total categories: {Category.objects.count()}'))
        self.stdout.write(self.style.INFO(f'Categories: {list(Category.objects.values_list("name", flat=True))}'))
