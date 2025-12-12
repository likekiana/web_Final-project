"""
用户模型定义
"""

from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


class User(AbstractUser):
    """自定义用户模型"""
    
    # 角色枚举
    class Role(models.TextChoices):
        STUDENT = 'student', _('普通学生用户')
        MERCHANT = 'merchant', _('商户/广告用户')
        MODERATOR = 'moderator', _('板块版主')
        ADMIN = 'admin', _('内容管理员')
        SUPER_ADMIN = 'superAdmin', _('超级管理员')
    
    # 状态枚举
    class Status(models.TextChoices):
        ACTIVE = 'active', _('活跃状态')
        BANNED = 'banned', _('封禁状态')
    
    # 基本信息
    username = models.CharField(_('用户名'), max_length=50, unique=True)
    email = models.EmailField(_('邮箱'), max_length=100, unique=True, db_index=True)
    password = models.CharField(_('密码'), max_length=255)
    avatar = models.ImageField(
        _('头像'), 
        upload_to='avatars/', 
        null=True, 
        blank=True,
        default='avatars/default.png'
    )
    bio = models.TextField(_('个人简介'), max_length=500, null=True, blank=True)
    
    # 角色与权限
    role = models.CharField(
        _('角色'), 
        max_length=20, 
        choices=Role.choices, 
        default=Role.STUDENT,
        db_index=True
    )
    status = models.CharField(
        _('状态'), 
        max_length=20, 
        choices=Status.choices, 
        default=Status.ACTIVE,
        db_index=True
    )
    
    # 统计信息
    reputation = models.IntegerField(_('信誉值'), default=100)
    post_count = models.IntegerField(_('发帖数'), default=0)
    comment_count = models.IntegerField(_('评论数'), default=0)
    
    # Django内置字段
    is_active = models.BooleanField(
        _('是否活跃'),
        default=True,
        help_text=_('指明用户是否可以登录')
    )
    is_staff = models.BooleanField(
        _('是否是管理员'),
        default=False,
        help_text=_('指明用户是否可以访问管理后台')
    )
    is_superuser = models.BooleanField(
        _('是否是超级用户'),
        default=False,
        help_text=_('指明用户是否拥有所有权限')
    )
    
    # 时间字段
    created_at = models.DateTimeField(_('创建时间'), auto_now_add=True)
    updated_at = models.DateTimeField(_('更新时间'), auto_now=True)
    
    # 修改Django认证字段
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    
    class Meta:
        verbose_name = _('用户')
        verbose_name_plural = _('用户')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['role']),
            models.Index(fields=['status']),
            models.Index(fields=['created_at']),
        ]
    
    def __str__(self):
        return self.username
    
    def get_full_name(self):
        return self.username
    
    def get_short_name(self):
        return self.username
    
    def save(self, *args, **kwargs):
        # 保存前的处理
        super().save(*args, **kwargs)
    
    # 自定义方法
    def is_student(self):
        return self.role == self.Role.STUDENT
    
    def is_merchant(self):
        return self.role == self.Role.MERCHANT
    
    def is_moderator(self):
        return self.role == self.Role.MODERATOR
    
    def is_admin(self):
        return self.role in [self.Role.ADMIN, self.Role.SUPER_ADMIN]
    
    def is_super_admin(self):
        return self.role == self.Role.SUPER_ADMIN
    
    def can_post_in_category(self, category):
        """检查用户是否可以在指定板块发帖"""
        # 超级管理员和管理员可以在任何板块发帖
        if self.is_admin():
            return True
        
        # 商户只能在广告专区发帖
        if self.is_merchant():
            return category.name == '广告专区'
        
        # 普通用户和版主可以在所有板块发帖
        return True
