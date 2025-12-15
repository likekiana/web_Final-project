"""
AI助手应用模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _


class KnowledgeBase(models.Model):
    """校园知识问答知识库模型"""
    
    # 问题类型枚举
    class QuestionType(models.TextChoices):
        ACADEMIC = 'academic', _('学习学术')
        CAMPUS_LIFE = 'campus_life', _('校园生活')
        ADMINISTRATION = 'administration', _('行政管理')
        OTHER = 'other', _('其他')
    
    # 问题内容
    question = models.CharField(
        _('问题'),
        max_length=500,
        unique=True,
        db_index=True
    )
    
    # 答案内容
    answer = models.TextField(
        _('答案'),
        max_length=2000
    )
    
    # 问题类型
    question_type = models.CharField(
        _('问题类型'),
        max_length=20,
        choices=QuestionType.choices,
        default=QuestionType.OTHER,
        db_index=True
    )
    
    # 关键词（用于匹配）
    keywords = models.JSONField(
        _('关键词'),
        default=list,
        help_text='用于匹配用户问题的关键词列表'
    )
    
    # 匹配权重
    weight = models.FloatField(
        _('匹配权重'),
        default=1.0,
        help_text='匹配权重，值越高越优先匹配'
    )
    
    # 热度（被访问次数）
    popularity = models.IntegerField(
        _('热度'),
        default=0,
        help_text='被访问次数'
    )
    
    # 状态
    is_active = models.BooleanField(
        _('是否活跃'),
        default=True,
        help_text='是否启用该知识库条目'
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('更新时间'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('知识库条目')
        verbose_name_plural = _('知识库')
        ordering = ['-weight', '-popularity']
    
    def __str__(self):
        return f"{self.question}"
    
    def increment_popularity(self):
        """增加热度计数"""
        self.popularity = models.F('popularity') + 1
        self.save(update_fields=['popularity'])
    
    @classmethod
    def get_by_keyword(cls, keyword):
        """根据关键词获取相关知识库条目"""
        return cls.objects.filter(
            is_active=True,
            keywords__contains=[keyword]
        ).order_by('-weight', '-popularity')


class AIResponseLog(models.Model):
    """AI响应日志模型"""
    
    # 响应类型枚举
    class ResponseType(models.TextChoices):
        KNOWLEDGE_BASE = 'knowledge_base', _('知识库匹配')
        AI_GENERATED = 'ai_generated', _('AI生成')
        ERROR = 'error', _('错误响应')
    
    # 用户输入
    user_input = models.TextField(
        _('用户输入'),
        max_length=1000
    )
    
    # AI响应
    ai_response = models.TextField(
        _('AI响应'),
        max_length=2000,
        null=True,
        blank=True
    )
    
    # 响应类型
    response_type = models.CharField(
        _('响应类型'),
        max_length=20,
        choices=ResponseType.choices,
        default=ResponseType.KNOWLEDGE_BASE
    )
    
    # 匹配的知识库条目
    knowledge_base = models.ForeignKey(
        KnowledgeBase,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='response_logs',
        verbose_name=_('匹配的知识库条目')
    )
    
    # 相似度分数
    similarity_score = models.FloatField(
        _('相似度分数'),
        null=True,
        blank=True,
        help_text='用户输入与知识库条目的相似度'
    )
    
    # 处理时间（毫秒）
    processing_time = models.IntegerField(
        _('处理时间'),
        null=True,
        blank=True,
        help_text='AI处理响应的时间（毫秒）'
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True
    )
    
    class Meta:
        verbose_name = _('AI响应日志')
        verbose_name_plural = _('AI响应日志')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"AI Response Log #{self.id}"