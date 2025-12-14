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
    
    # 检查用户是否有删除权限
    def has_delete_permission(self, request, obj=None):
        """检查用户是否有删除权限"""
        # 超级管理员可以删除所有用户
        if request.user.is_superuser:
            return True
        # 管理员可以删除非管理员和超级管理员用户
        if request.user.is_staff and obj and not obj.is_superuser:
            return True
        return False
    
    def get_actions(self, request):
        """获取可用操作列表"""
        actions = super().get_actions(request)
        # 确保删除操作可用
        if 'delete_selected' not in actions:
            from django.contrib.admin.actions import delete_selected
            actions['delete_selected'] = (delete_selected, 'delete_selected', _('删除选中的用户'))
        return actions


# 注册用户模型到后台管理
admin.site.register(User, UserAdmin)
