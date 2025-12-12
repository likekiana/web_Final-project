"""
用户认证应用后台管理配置
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.utils.translation import gettext_lazy as _

from .models import User


class UserAdmin(BaseUserAdmin):
    """自定义用户后台管理配置"""
    
    # 列表展示字段
    list_display = (
        'id', 'username', 'email', 'role', 'status', 
        'reputation', 'post_count', 'comment_count',
        'is_active', 'is_staff', 'is_superuser',
        'created_at', 'updated_at'
    )
    
    # 搜索字段
    search_fields = ('username', 'email')
    
    # 筛选字段
    list_filter = (
        'role', 'status', 'is_active', 'is_staff', 'is_superuser',
        'created_at'
    )
    
    # 分页数量
    list_per_page = 20
    
    # 排序字段
    ordering = ('-created_at',)
    
    # 详情页字段布局
    fieldsets = (
        (_('基本信息'), {
            'fields': ('username', 'email', 'password', 'avatar', 'bio')
        }),
        (_('角色与权限'), {
            'fields': ('role', 'status', 'is_active', 'is_staff', 'is_superuser')
        }),
        (_('统计信息'), {
            'fields': ('reputation', 'post_count', 'comment_count')
        }),
        (_('时间信息'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    
    # 添加用户表单
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'email', 'password1', 'password2',
                'role', 'is_active', 'is_staff', 'is_superuser'
            ),
        }),
    )
    
    # 只读字段
    readonly_fields = ('created_at', 'updated_at')


# 注册用户模型到后台管理
admin.site.register(User, UserAdmin)
