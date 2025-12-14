"""
私信模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class Message(models.Model):
    """私信模型"""
    
    # 消息状态枚举
    class Status(models.TextChoices):
        UNREAD = 'unread', _('未读')
        READ = 'read', _('已读')
    
    # 关联关系
    sender = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='sent_messages',
        verbose_name=_('发送者'),
        null=True,
        blank=True
    )
    recipient = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='received_messages',
        verbose_name=_('接收者')
    )
    
    # 内容信息
    subject = models.CharField(
        _('消息主题'),
        max_length=100,
        blank=True,
        null=True
    )
    content = models.TextField(
        _('消息内容'),
        max_length=2000
    )
    status = models.CharField(
        _('消息状态'),
        max_length=20,
        choices=Status.choices,
        default=Status.UNREAD,
        db_index=True
    )
    
    # 消息类型
    is_system = models.BooleanField(
        _('是否系统消息'),
        default=False
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
        verbose_name = _('私信')
        verbose_name_plural = _('私信')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['sender', '-created_at']),
            models.Index(fields=['recipient', 'status', '-created_at']),
            models.Index(fields=['is_system', '-created_at']),
        ]
        constraints = [
            models.CheckConstraint(
                condition=(models.Q(sender__isnull=False) | models.Q(is_system=True)),
                name='sender_or_system_constraint'
            )
        ]
    
    def __str__(self):
        return f"Message from {self.sender.username} to {self.recipient.username}"
    
    def mark_as_read(self):
        """标记为已读"""
        if self.status == self.Status.UNREAD:
            from datetime import datetime
            self.status = self.Status.READ
            self.read_at = datetime.now()
            self.save(update_fields=['status', 'read_at'])
    
    def get_conversation_partner(self, user):
        """获取对话的另一方用户"""
        if user == self.sender:
            return self.recipient
        return self.sender
