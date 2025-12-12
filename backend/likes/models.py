"""
点赞模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from content.models import Post, Comment


class Like(models.Model):
    """点赞模型"""
    
    # 目标类型枚举
    class TargetType(models.TextChoices):
        POST = 'post', _('帖子')
        COMMENT = 'comment', _('评论')
    
    # 关联关系
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='likes',
        verbose_name=_('点赞用户')
    )
    
    # 目标信息
    target_type = models.CharField(
        _('目标类型'), 
        max_length=20, 
        choices=TargetType.choices,
        db_index=True
    )
    target_id = models.BigIntegerField(
        _('目标ID'),
        db_index=True
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = _('点赞')
        verbose_name_plural = _('点赞')
        ordering = ['-created_at']
        # 唯一约束，确保用户对同一目标只能点赞一次
        unique_together = ('user', 'target_type', 'target_id')
        indexes = [
            models.Index(fields=['target_type', 'target_id', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.user.username} like {self.target_type} {self.target_id}"
    
    def get_target(self):
        """获取点赞的目标对象"""
        if self.target_type == self.TargetType.POST:
            return Post.objects.filter(id=self.target_id).first()
        elif self.target_type == self.TargetType.COMMENT:
            return Comment.objects.filter(id=self.target_id).first()
        return None
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # 增加目标的点赞数
        if is_new:
            target = self.get_target()
            if target:
                target.increment_likes_count()
    
    def delete(self, *args, **kwargs):
        """删除前的处理"""
        # 减少目标的点赞数
        target = self.get_target()
        if target:
            target.decrement_likes_count()
        
        super().delete(*args, **kwargs)
