"""
更新帖子统计信息管理命令
"""

from django.core.management.base import BaseCommand
from content.models import Post, Comment
from likes.models import Like


class Command(BaseCommand):
    """更新帖子统计信息命令"""
    help = '更新所有帖子的点赞数、评论数和浏览数统计信息'

    def handle(self, *args, **options):
        """命令处理逻辑"""
        self.stdout.write(self.style.SUCCESS('开始更新帖子统计信息...'))
        
        # 获取所有帖子
        posts = Post.objects.all()
        total_posts = posts.count()
        
        for index, post in enumerate(posts):
            # 更新评论数
            comment_count = Comment.objects.filter(post=post, status='normal').count()
            
            # 更新点赞数
            like_count = Like.objects.filter(target_type='post', target_id=post.id).count()
            
            # 更新帖子统计信息
            Post.objects.filter(id=post.id).update(
                comments_count=comment_count,
                likes_count=like_count
            )
            
            # 输出进度
            if (index + 1) % 10 == 0 or index + 1 == total_posts:
                self.stdout.write(
                    self.style.SUCCESS(f'已更新 {index + 1}/{total_posts} 个帖子')
                )
        
        self.stdout.write(self.style.SUCCESS('帖子统计信息更新完成！'))
