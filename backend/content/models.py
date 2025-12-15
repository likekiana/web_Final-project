"""
内容模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import F
from accounts.models import User


class Category(models.Model):
    """板块模型"""
    
    # 基本信息
    name = models.CharField(_('板块名称'), max_length=50, unique=True, db_index=True)
    description = models.TextField(_('板块描述'), max_length=500)
    icon = models.CharField(_('板块图标'), max_length=50, default='default')
    color = models.CharField(_('板块颜色'), max_length=20, default='#1890ff')
    
    # 统计信息
    post_count = models.IntegerField(_('帖子数量'), default=0)
    
    # 排序
    order = models.IntegerField(_('排序顺序'), default=0, db_index=True)
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('板块')
        verbose_name_plural = _('板块')
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name
    
    def increment_post_count(self):
        """增加帖子数量"""
        self.post_count = F('post_count') + 1
        self.save(update_fields=['post_count'])
    
    def decrement_post_count(self):
        """减少帖子数量"""
        self.post_count = F('post_count') - 1
        self.save(update_fields=['post_count'])


class Post(models.Model):
    """帖子模型"""
    
    # 帖子类型枚举
    class PostType(models.TextChoices):
        NORMAL = 'normal', _('普通帖子')
        TRADE = 'trade', _('二手交易帖子')
        ADVERTISEMENT = 'advertisement', _('广告帖子')
        ANONYMOUS = 'anonymous', _('匿名帖子')
    
    # 帖子状态枚举
    class Status(models.TextChoices):
        NORMAL = 'normal', _('正常状态')
        DELETED = 'deleted', _('已删除')
        REPORTED = 'reported', _('已举报')
    
    # 基本信息
    title = models.CharField(_('帖子标题'), max_length=255, db_index=True)
    content = models.TextField(_('帖子内容'), max_length=10000)
    type = models.CharField(
        _('帖子类型'), 
        max_length=20, 
        choices=PostType.choices, 
        default=PostType.NORMAL,
        db_index=True
    )
    
    # 媒体文件（图片和视频）
    media_files = models.JSONField(_('媒体文件URL数组'), default=list, null=True, blank=True)
    
    # 关联关系
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name=_('作者')
    )
    category = models.ForeignKey(
        Category, 
        on_delete=models.CASCADE, 
        related_name='posts',
        verbose_name=_('所属板块')
    )
    
    # 统计信息
    likes_count = models.IntegerField(_('点赞数'), default=0)
    comments_count = models.IntegerField(_('评论数'), default=0)
    views_count = models.IntegerField(_('浏览数'), default=0)
    
    # 标记
    is_sticky = models.BooleanField(_('是否置顶'), default=False, db_index=True)
    is_essential = models.BooleanField(_('是否精华'), default=False, db_index=True)
    
    # 状态
    status = models.CharField(
        _('帖子状态'), 
        max_length=20, 
        choices=Status.choices, 
        default=Status.NORMAL,
        db_index=True
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('帖子')
        verbose_name_plural = _('帖子')
        ordering = ['-is_sticky', '-is_essential', '-created_at']
        indexes = [
            models.Index(fields=['category', '-created_at']),
            models.Index(fields=['user', '-created_at']),
            models.Index(fields=['type', '-created_at']),
            models.Index(fields=['is_sticky', '-is_essential', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.id}: {self.title[:50]}"
    
    def increment_likes_count(self):
        """增加点赞数"""
        self.likes_count = F('likes_count') + 1
        self.save(update_fields=['likes_count'])
    
    def decrement_likes_count(self):
        """减少点赞数"""
        self.likes_count = F('likes_count') - 1
        self.save(update_fields=['likes_count'])
    
    def increment_comments_count(self):
        """增加评论数"""
        self.comments_count = F('comments_count') + 1
        self.save(update_fields=['comments_count'])
    
    def decrement_comments_count(self):
        """减少评论数"""
        self.comments_count = F('comments_count') - 1
        self.save(update_fields=['comments_count'])
    
    def increment_views_count(self):
        """增加浏览数"""
        self.views_count = F('views_count') + 1
        self.save(update_fields=['views_count'])


class Comment(models.Model):
    """评论模型"""
    
    # 评论状态枚举
    class Status(models.TextChoices):
        NORMAL = 'normal', _('正常状态')
        DELETED = 'deleted', _('已删除')
        REPORTED = 'reported', _('已举报')
    
    # 基本信息
    content = models.TextField(_('评论内容'), max_length=1000)
    
    # 关联关系
    user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name=_('评论者')
    )
    post = models.ForeignKey(
        Post, 
        on_delete=models.CASCADE, 
        related_name='comments',
        verbose_name=_('所属帖子')
    )
    
    # 统计信息
    likes_count = models.IntegerField(_('点赞数'), default=0)
    
    # 状态
    status = models.CharField(
        _('评论状态'), 
        max_length=20, 
        choices=Status.choices, 
        default=Status.NORMAL,
        db_index=True
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    class Meta:
        verbose_name = _('评论')
        verbose_name_plural = _('评论')
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['post', '-created_at']),
            models.Index(fields=['user', '-created_at']),
        ]
    
    def __str__(self):
        return f"Comment {self.id} on Post {self.post_id}"
    
    def increment_likes_count(self):
        """增加点赞数"""
        self.likes_count = F('likes_count') + 1
        self.save(update_fields=['likes_count'])
    
    def decrement_likes_count(self):
        """减少点赞数"""
        self.likes_count = F('likes_count') - 1
        self.save(update_fields=['likes_count'])
