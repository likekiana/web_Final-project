from django.db import models
from django.utils.translation import gettext_lazy as _


class AuditResult(models.Model):
    """AI审核结果模型"""
    
    # 审核类型枚举
    class AuditType(models.TextChoices):
        POST = 'post', _('帖子审核')
        COMMENT = 'comment', _('评论审核')
    
    # 违规类型枚举
    class ViolationType(models.TextChoices):
        NONE = 'none', _('无违规')
        PORNOGRAPHY = 'pornography', _('色情内容')
        VIOLENCE = 'violence', _('暴力内容')
        ADVERTISEMENT = 'advertisement', _('广告内容')
        ABUSE = 'abuse', _('辱骂内容')
        SENSITIVE = 'sensitive', _('敏感内容')
        OTHER = 'other', _('其他违规')
    
    # 关联对象ID
    object_id = models.PositiveIntegerField(_('审核对象ID'), db_index=True)
    audit_type = models.CharField(
        _('审核类型'),
        max_length=20,
        choices=AuditType.choices,
        db_index=True
    )
    
    # 审核结果
    violation_type = models.CharField(
        _('违规类型'),
        max_length=20,
        choices=ViolationType.choices,
        default=ViolationType.NONE
    )
    confidence = models.FloatField(_('置信度'), default=0.0)
    has_violation = models.BooleanField(_('是否违规'), default=False)
    
    # 违规详情
    sensitive_words = models.JSONField(_('检测到的敏感词'), default=list, null=True, blank=True)
    violation_reason = models.TextField(_('违规原因'), null=True, blank=True)
    
    # 时间字段
    created_at = models.DateTimeField(_('审核时间'), auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = _('AI审核结果')
        verbose_name_plural = _('AI审核结果')
        indexes = [
            models.Index(fields=['object_id', 'audit_type']),
            models.Index(fields=['has_violation', 'created_at']),
            models.Index(fields=['violation_type', 'created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_audit_type_display()} - {self.object_id}: {self.get_violation_type_display()} ({self.confidence:.2f})"


class AuditConfig(models.Model):
    """AI审核配置模型"""
    
    # 配置项
    name = models.CharField(_('配置名称'), max_length=100, unique=True)
    value = models.JSONField(_('配置值'), default=dict)
    description = models.TextField(_('配置描述'), null=True, blank=True)
    
    # 时间字段
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('AI审核配置')
        verbose_name_plural = _('AI审核配置')
    
    def __str__(self):
        return self.name

