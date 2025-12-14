"""
浏览历史模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from content.models import Post


class BrowsingHistory(models.Model):
    """浏览历史模型"""
    
    # 关联关系
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='browsing_history',
        verbose_name=_('用户')
    )
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='browsing_history',
        verbose_name=_('帖子')
    )
    
    # 时间字段
    viewed_at = models.DateTimeField(
        _('浏览时间'),
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        verbose_name = _('浏览历史')
        verbose_name_plural = _('浏览历史')
        ordering = ['-viewed_at']
        # 唯一约束，确保每个用户对每个帖子只有一条记录
        unique_together = ['user', 'post']
        indexes = [
            models.Index(fields=['user', '-viewed_at']),
            models.Index(fields=['post', '-viewed_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} viewed post {self.post.title[:20]} at {self.viewed_at}"
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        super().save(*args, **kwargs)
