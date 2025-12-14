"""
更新用户统计信息管理命令
"""

from django.core.management.base import BaseCommand
from django.db.models import Count

from accounts.models import User
from content.models import Post, Comment


class Command(BaseCommand):
    """更新用户统计信息命令"""
    help = '更新所有用户的发帖数、评论数和信誉值统计信息'

    def handle(self, *args, **options):
        """命令处理逻辑"""
        self.stdout.write(self.style.SUCCESS('开始更新用户统计信息...'))
        
        # 获取所有用户
        users = User.objects.all()
        total_users = users.count()
        
        for index, user in enumerate(users):
            # 更新发帖数
            post_count = Post.objects.filter(user=user, status='normal').count()
            
            # 更新评论数
            comment_count = Comment.objects.filter(user=user, status='normal').count()
            
            # 更新信誉值（这里简单使用发帖数*2 + 评论数）
            # 实际项目中可能需要更复杂的算法
            reputation = post_count * 2 + comment_count
            
            # 更新用户信息
            User.objects.filter(id=user.id).update(
                post_count=post_count,
                comment_count=comment_count,
                reputation=reputation
            )
            
            # 输出进度
            if (index + 1) % 10 == 0 or index + 1 == total_users:
                self.stdout.write(
                    self.style.SUCCESS(f'已更新 {index + 1}/{total_users} 个用户')
                )
        
        self.stdout.write(self.style.SUCCESS('用户统计信息更新完成！'))
