"""
举报模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from content.models import Post, Comment


class Report(models.Model):
    """举报模型"""
    
    # 举报类型枚举
    class ReportType(models.TextChoices):
        SPAM = 'spam', _('垃圾广告')
        PORNOGRAPHY = 'pornography', _('色情内容')
        VIOLENCE = 'violence', _('暴力内容')
        OTHER = 'other', _('其他违规内容')
    
    # 处理状态枚举
    class Status(models.TextChoices):
        PENDING = 'pending', _('待处理')
        PROCESSED = 'processed', _('已处理')
    
    # 处理动作枚举
    class Action(models.TextChoices):
        IGNORE = 'ignore', _('忽略')
        DELETE = 'delete', _('删除内容')
        WARN = 'warn', _('警告用户')
    
    # 目标类型枚举
    class TargetType(models.TextChoices):
        POST = 'post', _('帖子')
        COMMENT = 'comment', _('评论')
    
    # 举报信息
    type = models.CharField(
        _('举报类型'), 
        max_length=20, 
        choices=ReportType.choices,
        db_index=True
    )
    reason = models.TextField(
        _('举报原因'), 
        max_length=1000, 
        null=True, 
        blank=True
    )
    
    # 关联关系
    reporter = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='reported',
        verbose_name=_('举报人')
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
    
    # 处理信息
    status = models.CharField(
        _('处理状态'), 
        max_length=20, 
        choices=Status.choices, 
        default=Status.PENDING,
        db_index=True
    )
    action = models.CharField(
        _('处理动作'), 
        max_length=20, 
        choices=Action.choices, 
        null=True, 
        blank=True
    )
    notes = models.TextField(
        _('处理备注'), 
        max_length=1000, 
        null=True, 
        blank=True
    )
    processed_by = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='processed_reports',
        verbose_name=_('处理人')
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('举报')
        verbose_name_plural = _('举报')
        ordering = ['status', '-created_at']
        indexes = [
            models.Index(fields=['target_type', 'target_id']),
            models.Index(fields=['status', '-created_at']),
            models.Index(fields=['type', '-created_at']),
            models.Index(fields=['reporter', '-created_at']),
            models.Index(fields=['processed_by', '-created_at']),
        ]
    
    def __str__(self):
        return f"Report {self.id}: {self.type} on {self.target_type} {self.target_id}"
    
    def get_target(self):
        """获取举报的目标对象"""
        if self.target_type == self.TargetType.POST:
            return Post.objects.filter(id=self.target_id).first()
        elif self.target_type == self.TargetType.COMMENT:
            return Comment.objects.filter(id=self.target_id).first()
        return None
    
    def process(self, action, notes, processed_by):
        """处理举报"""
        self.status = self.Status.PROCESSED
        self.action = action
        self.notes = notes
        self.processed_by = processed_by
        self.save()
        
        # 根据处理动作执行相应操作
        target = self.get_target()
        if target:
            if action == self.Action.DELETE:
                # 设置目标状态为已删除
                target.status = 'deleted'
                target.save(update_fields=['status'])
            elif action == self.Action.WARN:
                # 可以在这里添加警告用户的逻辑
                pass
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # 如果是新举报，将目标状态设置为已举报
        if is_new:
            target = self.get_target()
            if target and hasattr(target, 'status'):
                target.status = 'reported'
                target.save(update_fields=['status'])
