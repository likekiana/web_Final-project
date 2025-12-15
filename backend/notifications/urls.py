"""
通知应用路由配置
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import NotificationViewSet, NotificationMarkAllReadView, NotificationCountView

# 创建路由
router = SimpleRouter()
router.register('', NotificationViewSet, basename='notifications')

urlpatterns = [
    # 通知列表、详情、更新、删除
    path('', include(router.urls)),
    # 标记所有通知为已读
    path('mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    # 获取未读通知数量
    path('count/', NotificationCountView.as_view(), name='notification-count'),
]