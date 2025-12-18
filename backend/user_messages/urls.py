"""
私信应用URL配置
"""

from django.urls import path
from .views import (
    MessageViewSet, MessageConversationView,
    MessageConversationListView, MessageMarkAllReadView, MessageCountView
)

# 创建视图集的实例
message_viewset = MessageViewSet.as_view({
    'get': 'list',
    'post': 'create'
})
message_detail_view = MessageViewSet.as_view({
    'get': 'retrieve',
    'patch': 'partial_update',
    'delete': 'destroy'
})

# 定义URL模式
urlpatterns = [
    # 私信列表和创建
    path('', message_viewset, name='message-list-create'),
    # 私信详情、更新和删除
    path('<int:pk>/', message_detail_view, name='message-detail'),
    # 获取与特定用户的对话
    path('conversation/<int:user_id>/', MessageConversationView.as_view(), name='message-conversation'),
    # 获取对话列表
    path('conversations/', MessageConversationListView.as_view(), name='message-conversations'),
    # 标记所有私信为已读
    path('mark-all-read/', MessageMarkAllReadView.as_view(), name='message-mark-all-read'),
    # 获取未读私信数量
    path('count/', MessageCountView.as_view(), name='message-count'),
]
