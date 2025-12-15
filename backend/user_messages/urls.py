"""
私信应用路由配置
"""

from django.urls import path, include
from rest_framework.routers import SimpleRouter

from .views import (
    MessageViewSet, MessageConversationView, 
    MessageConversationListView, MessageMarkAllReadView, 
    MessageCountView
)

# 创建路由
router = SimpleRouter()
router.register('', MessageViewSet, basename='messages')

urlpatterns = [
    # 私信列表、详情、创建、更新、删除
    path('', include(router.urls)),
    # 获取与特定用户的对话
    path('conversation/<int:user_id>/', MessageConversationView.as_view(), name='message-conversation'),
    # 获取对话列表
    path('conversations/', MessageConversationListView.as_view(), name='message-conversation-list'),
    # 标记所有私信为已读
    path('mark-all-read/', MessageMarkAllReadView.as_view(), name='message-mark-all-read'),
    # 获取未读私信数量
    path('count/', MessageCountView.as_view(), name='message-count'),
]