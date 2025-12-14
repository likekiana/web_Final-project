"""
通知模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from content.models import Post, Comment


class Notification(models.Model):
    """通知模型"""
    
    # 通知类型枚举
    class NotificationType(models.TextChoices):
        LIKE = 'like', _('点赞通知')
        COMMENT = 'comment', _('评论通知')
        FOLLOW = 'follow', _('关注通知')
        REPORT = 'report', _('举报处理通知')
        SYSTEM = 'system', _('系统通知')
        ADMIN = 'admin', _('管理员通知')
    
    # 通知状态枚举
    class Status(models.TextChoices):
        UNREAD = 'unread', _('未读')
        READ = 'read', _('已读')
    
    # 关联关系
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='notifications',
        verbose_name=_('接收者')
    )
    sender = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='sent_notifications',
        verbose_name=_('发送者')
    )
    
    # 内容信息
    title = models.CharField(
        _('通知标题'),
        max_length=100
    )
    content = models.TextField(
        _('通知内容'),
        max_length=500
    )
    notification_type = models.CharField(
        _('通知类型'),
        max_length=20,
        choices=NotificationType.choices,
        db_index=True
    )
    status = models.CharField(
        _('通知状态'),
        max_length=20,
        choices=Status.choices,
        default=Status.UNREAD,
        db_index=True
    )
    
    # 关联的对象
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('关联帖子')
    )
    comment = models.ForeignKey(
        Comment,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='notifications',
        verbose_name=_('关联评论')
    )
    
    # 额外数据
    extra_data = models.JSONField(
        _('额外数据'),
        default=dict,
        null=True,
        blank=True
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True,
        db_index=True
    )
    read_at = models.DateTimeField(
        _('阅读时间'),
        null=True,
        blank=True
    )
    
    class Meta:
        verbose_name = _('通知')
        verbose_name_plural = _('通知')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['recipient', 'status', '-created_at']),
            models.Index(fields=['notification_type', '-created_at']),
            models.Index(fields=['sender', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.notification_type} notification for {self.recipient.username}"
    
    def mark_as_read(self):
        """标记为已读"""
        if self.status == self.Status.UNREAD:
            self.status = self.Status.READ
            from datetime import datetime
            self.read_at = datetime.now()
            self.save(update_fields=['status', 'read_at'])
    
    def get_related_object(self):
        """获取关联对象"""
        if self.post:
            return self.post
        elif self.comment:
            return self.comment
        return None
