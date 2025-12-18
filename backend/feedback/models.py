"""
功能反馈模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class Feedback(models.Model):
    """功能反馈模型"""
    
    # 反馈类型枚举
    class FeedbackType(models.TextChoices):
        SUGGESTION = 'suggestion', _('功能建议')
        BUG = 'bug', _('Bug反馈')
        OTHER = 'other', _('其他反馈')
    
    # 处理状态枚举
    class Status(models.TextChoices):
        PENDING = 'pending', _('待处理')
        PROCESSING = 'processing', _('处理中')
        RESOLVED = 'resolved', _('已解决')
        REJECTED = 'rejected', _('已驳回')
    
    # 基本信息
    type = models.CharField(
        _('反馈类型'),
        max_length=20,
        choices=FeedbackType.choices,
        default=FeedbackType.SUGGESTION,
        db_index=True
    )
    
    title = models.CharField(
        _('反馈标题'),
        max_length=200,
        help_text='简洁描述反馈内容'
    )
    
    content = models.TextField(
        _('反馈内容'),
        max_length=5000,
        help_text='详细描述反馈内容、问题复现步骤等'
    )
    
    contact_info = models.CharField(
        _('联系方式'),
        max_length=200,
        null=True,
        blank=True,
        help_text='邮箱、电话等，方便我们联系您'
    )
    
    # 状态信息
    status = models.CharField(
        _('处理状态'),
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
        db_index=True
    )
    
    # 处理信息
    processed_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_feedbacks',
        verbose_name=_('处理人')
    )
    
    processed_at = models.DateTimeField(
        _('处理时间'),
        null=True,
        blank=True
    )
    
    reply = models.TextField(
        _('处理回复'),
        max_length=2000,
        null=True,
        blank=True,
        help_text='对反馈的处理回复'
    )
    
    # 关联字段
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='feedbacks',
        verbose_name=_('反馈人')
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True,
        db_index=True
    )
    
    updated_at = models.DateTimeField(
        _('更新时间'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('功能反馈')
        verbose_name_plural = _('功能反馈')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_type_display()})"
    
    def process(self, processed_by, status, reply=None):
        """处理反馈"""
        self.status = status
        self.processed_by = processed_by
        self.processed_at = models.DateTimeField(auto_now=True)
        if reply:
            self.reply = reply
        self.save(update_fields=['status', 'processed_by', 'processed_at', 'reply'])
    
    def save(self, *args, **kwargs):
        """保存反馈信息"""
        super().save(*args, **kwargs)
