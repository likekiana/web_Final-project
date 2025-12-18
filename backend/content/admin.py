"""
内容管理应用后台管理配置
"""

from django.contrib import admin
from django.utils.translation import gettext_lazy as _

from .models import Category, Post, Comment


class CategoryAdmin(admin.ModelAdmin):
    """板块后台管理配置"""
    
    list_display = ('id', 'name', 'description', 'order', 'created_at')
    search_fields = ('name', 'description')
    list_filter = ('created_at',)
    list_per_page = 20
    ordering = ('order', 'name')
    fieldsets = (
        (_('基本信息'), {
            'fields': ('name', 'description', 'icon', 'color')
        }),
        (_('排序'), {
            'fields': ('order',)
        }),
        (_('时间信息'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


class PostAdmin(admin.ModelAdmin):
    """帖子后台管理配置"""
    
    list_display = (
        'id', 'title', 'user', 'category', 'type', 'status',
        'likes_count', 'comments_count', 'views_count',
        'is_sticky', 'is_essential', 'created_at'
    )
    search_fields = ('title', 'content')
    list_filter = (
        'type', 'status', 'is_sticky', 'is_essential',
        'category', 'user', 'created_at'
    )
    list_per_page = 20
    ordering = ('-is_sticky', '-is_essential', '-created_at')
    fieldsets = (
        (_('基本信息'), {
            'fields': ('title', 'content', 'images', 'type', 'url')
        }),
        (_('关联信息'), {
            'fields': ('user', 'category')
        }),
        (_('标记与状态'), {
            'fields': ('is_sticky', 'is_essential', 'status')
        }),
        (_('统计信息'), {
            'fields': ('likes_count', 'comments_count', 'views_count')
        }),
        (_('时间信息'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


class CommentAdmin(admin.ModelAdmin):
    """评论后台管理配置"""
    
    list_display = (
        'id', 'content', 'user', 'post', 'status',
        'likes_count', 'created_at'
    )
    search_fields = ('content',)
    list_filter = (
        'status', 'post', 'user', 'created_at'
    )
    list_per_page = 20
    ordering = ('-created_at',)
    fieldsets = (
        (_('基本信息'), {
            'fields': ('content', 'status')
        }),
        (_('关联信息'), {
            'fields': ('user', 'post')
        }),
        (_('统计信息'), {
            'fields': ('likes_count',)
        }),
        (_('时间信息'), {
            'fields': ('created_at', 'updated_at')
        }),
    )
    readonly_fields = ('created_at', 'updated_at')


# 注册模型到后台管理
admin.site.register(Category, CategoryAdmin)
admin.site.register(Post, PostAdmin)
admin.site.register(Comment, CommentAdmin)
