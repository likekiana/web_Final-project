"""
用户认证应用路由配置
"""

from django.urls import path
from .views import (
    UserRegisterView, UserLoginView, UserProfileView,
    UserDetailView, UserListView, UserRoleUpdateView,
    UserStatusUpdateView
)

urlpatterns = [
    # 认证相关路由
    path('auth/register', UserRegisterView.as_view(), name='user-register'),
    path('auth/login', UserLoginView.as_view(), name='user-login'),
    path('auth/me', UserProfileView.as_view(), name='user-profile'),
    
    # 用户相关路由
    path('users/<int:id>', UserDetailView.as_view(), name='user-detail'),
    
    # 管理员相关路由
    path('admin/users', UserListView.as_view(), name='admin-user-list'),
    path('admin/users/<int:id>/role', UserRoleUpdateView.as_view(), name='admin-user-role-update'),
    path('admin/users/<int:id>/status', UserStatusUpdateView.as_view(), name='admin-user-status-update'),
]
