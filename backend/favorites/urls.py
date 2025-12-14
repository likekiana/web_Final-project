"""
收藏应用URL配置
"""

from django.urls import path
from .views import (
    FavoriteToggleView,
    FavoriteListView,
    FavoriteCheckView
)

urlpatterns = [
    # 收藏/取消收藏
    path('toggle/<int:post_id>/', FavoriteToggleView.as_view(), name='favorite-toggle'),
    # 获取用户收藏列表
    path('list/', FavoriteListView.as_view(), name='favorite-list'),
    # 检查帖子是否已被收藏
    path('check/<int:post_id>/', FavoriteCheckView.as_view(), name='favorite-check'),
]
