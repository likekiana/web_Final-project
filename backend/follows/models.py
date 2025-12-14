"""
关注模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class Follow(models.Model):
    """关注模型"""
    
    # 关联关系
    follower = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='following',
        verbose_name=_('关注者')
    )
    following = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='followers',
        verbose_name=_('被关注者')
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('关注时间'),
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        verbose_name = _('关注')
        verbose_name_plural = _('关注')
        ordering = ['-created_at']
        # 唯一约束，确保用户对同一用户只能关注一次
        unique_together = ['follower', 'following']
        indexes = [
            models.Index(fields=['follower', '-created_at']),
            models.Index(fields=['following', '-created_at']),
        ]
        # 约束：不能关注自己
        constraints = [
            models.CheckConstraint(
                condition=~models.Q(follower=models.F('following')),
                name='not_follow_self_constraint'
            )
        ]
    
    def __str__(self):
        return f"{self.follower.username} follows {self.following.username}"
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # 如果是新关注，发送通知给被关注者
        if is_new:
            # 这里可以添加通知逻辑，例如创建一个关注通知
            pass
    
    def delete(self, *args, **kwargs):
        """删除前的处理"""
        super().delete(*args, **kwargs)
        
        # 可以在这里添加相关逻辑
