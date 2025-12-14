"""
关注应用URL配置
"""

from django.urls import path
from .views import (
    FollowToggleView,
    FollowingListView,
    FollowersListView,
    FollowCheckView,
    OtherUserFollowingListView,
    OtherUserFollowersListView
)

urlpatterns = [
    # 关注/取消关注
    path('toggle/<int:user_id>/', FollowToggleView.as_view(), name='follow-toggle'),
    # 获取当前用户关注列表
    path('following/', FollowingListView.as_view(), name='following-list'),
    # 获取当前用户粉丝列表
    path('followers/', FollowersListView.as_view(), name='followers-list'),
    # 检查是否已关注某用户
    path('check/<int:user_id>/', FollowCheckView.as_view(), name='follow-check'),
    # 获取其他用户关注列表
    path('<int:user_id>/following/', OtherUserFollowingListView.as_view(), name='other-following-list'),
    # 获取其他用户粉丝列表
    path('<int:user_id>/followers/', OtherUserFollowersListView.as_view(), name='other-followers-list'),
]
