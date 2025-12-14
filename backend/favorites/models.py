"""
收藏模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from content.models import Post


class Favorite(models.Model):
    """收藏模型"""
    
    # 关联关系
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name=_('收藏用户')
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='favorites',
        verbose_name=_('收藏帖子')
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('收藏时间'),
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        verbose_name = _('收藏')
        verbose_name_plural = _('收藏')
        ordering = ['-created_at']
        # 唯一约束，确保用户对同一帖子只能收藏一次
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['post', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} favorited {self.post.title}"
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # 可以在这里添加通知逻辑，例如通知帖子作者被收藏
    
    def delete(self, *args, **kwargs):
        """删除前的处理"""
        super().delete(*args, **kwargs)
        
        # 可以在这里添加相关逻辑
