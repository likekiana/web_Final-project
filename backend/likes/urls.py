"""
点赞应用路由配置
"""

from django.urls import path
from .views import LikeToggleView

urlpatterns = [
    # 点赞/取消点赞路由
    path('likes/<str:target_type>/<int:target_id>', LikeToggleView.as_view(), name='like-toggle'),