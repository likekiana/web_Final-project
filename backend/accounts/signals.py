"""
用户模型相关信号处理
"""

from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import F

from accounts.models import User
from content.models import Post, Comment
from likes.models import Like


@receiver(post_save, sender=Post)
def update_user_post_count_on_save(sender, instance, created, **kwargs):
    """当帖子创建或更新时更新用户发帖数"""
    if created:
        # 帖子创建时，增加用户发帖数
        User.objects.filter(id=instance.user.id).update(
            post_count=F('post_count') + 1
        )


@receiver(post_delete, sender=Post)
def update_user_post_count_on_delete(sender, instance, **kwargs):
    """当帖子删除时更新用户发帖数"""
    # 帖子删除时，减少用户发帖数
    User.objects.filter(id=instance.user.id).update(
        post_count=F('post_count') - 1
    )


@receiver(post_save, sender=Comment)
def update_user_comment_count_on_save(sender, instance, created, **kwargs):
    """当评论创建或更新时更新用户评论数"""
    if created:
        # 评论创建时，增加用户评论数
        User.objects.filter(id=instance.user.id).update(
            comment_count=F('comment_count') + 1
        )


@receiver(post_delete, sender=Comment)
def update_user_comment_count_on_delete(sender, instance, **kwargs):
    """当评论删除时更新用户评论数"""
    # 评论删除时，减少用户评论数
    User.objects.filter(id=instance.user.id).update(
        comment_count=F('comment_count') - 1
    )


@receiver(post_save, sender=Like)
def update_user_reputation_on_like_save(sender, instance, created, **kwargs):
    """当点赞创建或更新时更新用户信誉值"""
    if created:
        # 获取点赞的目标对象
        if instance.target_type == 'post':
            target = Post.objects.filter(id=instance.target_id).first()
        elif instance.target_type == 'comment':
            target = Comment.objects.filter(id=instance.target_id).first()
        else:
            return
        
        if target:
            # 增加目标作者的信誉值
            User.objects.filter(id=target.user.id).update(
                reputation=F('reputation') + 1
            )


@receiver(post_delete, sender=Like)
def update_user_reputation_on_like_delete(sender, instance, **kwargs):
    """当点赞删除时更新用户信誉值"""
    # 获取点赞的目标对象
    if instance.target_type == 'post':
        target = Post.objects.filter(id=instance.target_id).first()
    elif instance.target_type == 'comment':
        target = Comment.objects.filter(id=instance.target_id).first()
    else:
        return
    
    if target:
        # 减少目标作者的信誉值
        User.objects.filter(id=target.user.id).update(
            reputation=F('reputation') - 1
        )
