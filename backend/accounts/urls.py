"""
用户认证应用路由配置
"""

from django.urls import path
from .views import (
    UserRegisterView, UserLoginView, UserProfileView,
    UserDetailView, UserListView, UserRoleUpdateView,
    UserStatusUpdateView, UserPostsView
)

urlpatterns = [
    # 认证相关路由 - 由/api/auth/前缀访问
    path('register', UserRegisterView.as_view(), name='user-register'),
    path('login', UserLoginView.as_view(), name='user-login'),
    path('me', UserProfileView.as_view(), name='user-profile'),
    
    # 用户相关路由 - 由/api/users/前缀访问
    path('<int:id>', UserDetailView.as_view(), name='user-detail'),
    path('<int:id>/posts', UserPostsView.as_view(), name='user-posts'),
    
    # 管理员相关路由 - 由/api/admin/前缀访问
    path('users', UserListView.as_view(), name='admin-user-list'),
    path('users/<int:id>/role', UserRoleUpdateView.as_view(), name='admin-user-role-update'),
    path('users/<int:id>/status', UserStatusUpdateView.as_view(), name='admin-user-status-update'),
]
