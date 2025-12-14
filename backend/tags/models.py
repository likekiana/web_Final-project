"""
标签模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from content.models import Post


class Tag(models.Model):
    """标签模型"""
    
    # 基本信息
    name = models.CharField(
        _('标签名称'),
        max_length=30,
        unique=True,
        db_index=True
    )
    description = models.TextField(
        _('标签描述'),
        max_length=200,
        blank=True,
        null=True
    )
    
    # 统计信息
    post_count = models.IntegerField(
        _('关联帖子数量'),
        default=0
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
        verbose_name = _('标签')
        verbose_name_plural = _('标签')
        ordering = ['name']
        indexes = [
            models.Index(fields=['name']),
        ]
    
    def __str__(self):
        return self.name
    
    def increment_post_count(self):
        """增加关联帖子数量"""
        from django.db.models import F
        self.post_count = F('post_count') + 1
        self.save(update_fields=['post_count'])
    
    def decrement_post_count(self):
        """减少关联帖子数量"""
        from django.db.models import F
        self.post_count = F('post_count') - 1
        self.save(update_fields=['post_count'])


class PostTag(models.Model):
    """帖子与标签的多对多关系模型"""
    
    # 关联关系
    post = models.ForeignKey(
        Post,
        on_delete=models.CASCADE,
        related_name='tag_relations',
        verbose_name=_('帖子')
    )
    tag = models.ForeignKey(
        Tag,
        on_delete=models.CASCADE,
        related_name='post_relations',
        verbose_name=_('标签')
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True
    )
    
    class Meta:
        verbose_name = _('帖子标签关系')
        verbose_name_plural = _('帖子标签关系')
        unique_together = ['post', 'tag']
        indexes = [
            models.Index(fields=['post']),
            models.Index(fields=['tag']),
        ]
    
    def __str__(self):
        return f"{self.post.title} - {self.tag.name}"
    
    def save(self, *args, **kwargs):
        """保存前的处理"""
        is_new = self.pk is None
        super().save(*args, **kwargs)
        
        # 如果是新关联，增加标签的帖子计数
        if is_new:
            self.tag.increment_post_count()
    
    def delete(self, *args, **kwargs):
        """删除前的处理"""
        # 减少标签的帖子计数
        self.tag.decrement_post_count()
        super().delete(*args, **kwargs)
