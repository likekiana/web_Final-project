"""
内容管理应用信号处理
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F

from content.models import Post, Comment
from likes.models import Like


@receiver(post_save, sender=Comment)
def update_post_comments_count_on_save(sender, instance, created, **kwargs):
    """当评论创建或更新时更新帖子评论数"""
    if created:
        # 评论创建时，增加帖子评论数
        Post.objects.filter(id=instance.post.id).update(
            comments_count=F('comments_count') + 1
        )


@receiver(post_delete, sender=Comment)
def update_post_comments_count_on_delete(sender, instance, **kwargs):
    """当评论删除时更新帖子评论数"""
    # 评论删除时，减少帖子评论数
    Post.objects.filter(id=instance.post.id).update(
        comments_count=F('comments_count') - 1
    )


@receiver(post_save, sender=Like)
def update_target_likes_count_on_save(sender, instance, created, **kwargs):
    """当点赞创建或更新时更新目标点赞数"""
    if created:
        # 点赞创建时，增加目标点赞数
        if instance.target_type == 'post':
            Post.objects.filter(id=instance.target_id).update(
                likes_count=F('likes_count') + 1
            )
        elif instance.target_type == 'comment':
            Comment.objects.filter(id=instance.target_id).update(
                likes_count=F('likes_count') + 1
            )


@receiver(post_delete, sender=Like)
def update_target_likes_count_on_delete(sender, instance, **kwargs):
    """当点赞删除时更新目标点赞数"""
    # 点赞删除时，减少目标点赞数
    if instance.target_type == 'post':
        Post.objects.filter(id=instance.target_id).update(
            likes_count=F('likes_count') - 1
        )
    elif instance.target_type == 'comment':
        Comment.objects.filter(id=instance.target_id).update(
            likes_count=F('likes_count') - 1
        )
