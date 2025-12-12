"""
广告模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class Advertisement(models.Model):
    """广告模型"""
    
    # 广告状态枚举
    class Status(models.TextChoices):
        PENDING = 'pending', _('待审核')
        ACTIVE = 'active', _('已发布')
        REJECTED = 'rejected', _('已拒绝')
        EXPIRED = 'expired', _('已过期')
    
    # 基本信息
    title = models.CharField(_('广告标题'), max_length=255, db_index=True)
    content = models.TextField(_('广告内容'), max_length=5000)
    images = models.JSONField(
        _('广告图片'), 
        default=list, 
        null=True, 
        blank=True
    )
    url = models.URLField(
        _('广告链接'), 
        max_length=500, 
        null=True, 
        blank=True
    )
    
    # 关联关系
    merchant = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='advertisements',
        verbose_name=_('发布商户')
    )
    
    # 时间信息
    start_date = models.DateTimeField(_('开始时间'), null=True, blank=True)
    end_date = models.DateTimeField(_('结束时间'), null=True, blank=True)
    
    # 状态信息
    status = models.CharField(
        _('广告状态'), 
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING,
        db_index=True
    )
    
    # 统计信息
    views_count = models.IntegerField(_('浏览数'), default=0)
    clicks_count = models.IntegerField(_('点击数'), default=0)
    
    # 审核信息
    review_notes = models.TextField(
        _('审核备注'), 
        max_length=1000, 
        null=True, 
        blank=True
    )
    reviewed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='reviewed_advertisements',
        verbose_name=_('审核人')
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('广告')
        verbose_name_plural = _('广告')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['merchant', '-created_at']),
            models.Index(fields=['start_date', 'end_date']),
        ]
    
    def __str__(self):
        return f"{self.title} by {self.merchant.username}"
    
    def increment_views(self):
        """增加浏览数"""
        self.views_count = models.F('views_count') + 1
        self.save(update_fields=['views_count'])
    
    def increment_clicks(self):
        """增加点击数"""
        self.clicks_count = models.F('clicks_count') + 1
        self.save(update_fields=['clicks_count'])
    
    def is_active(self):
        """检查广告是否处于活跃状态"""
        from datetime import datetime
        return self.status == self.Status.ACTIVE and \
               (self.start_date is None or self.start_date <= datetime.now()) and \
               (self.end_date is None or self.end_date >= datetime.now())
    
    def approve(self, reviewed_by):
        """审核通过广告"""
        self.status = self.Status.ACTIVE
        self.reviewed_by = reviewed_by
        self.save(update_fields=['status', 'reviewed_by'])
    
    def reject(self, reviewed_by, notes):
        """拒绝广告"""
        self.status = self.Status.REJECTED
        self.reviewed_by = reviewed_by
        self.review_notes = notes
        self.save(update_fields=['status', 'reviewed_by', 'review_notes'])
