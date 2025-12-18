"""
更新板块帖子数量管理命令
"""

from django.core.management.base import BaseCommand
from content.models import Category, Post


class Command(BaseCommand):
    """更新板块帖子数量命令"""
    help = '更新所有板块的帖子数量统计信息'

    def handle(self, *args, **options):
        """命令处理逻辑"""
        self.stdout.write(self.style.SUCCESS('开始更新板块帖子数量...'))
        
        # 获取所有板块
        categories = Category.objects.all()
        total_categories = categories.count()
        
        for index, category in enumerate(categories):
            # 更新帖子数量，只统计正常状态的帖子
            post_count = Post.objects.filter(category=category, status='normal').count()
            
            # 更新板块统计信息
            Category.objects.filter(id=category.id).update(
                post_count=post_count
            )
            
            # 输出进度
            if (index + 1) % 5 == 0 or index + 1 == total_categories:
                self.stdout.write(
                    self.style.SUCCESS(f'已更新 {index + 1}/{total_categories} 个板块')
                )
        
        self.stdout.write(self.style.SUCCESS('板块帖子数量更新完成！'))
