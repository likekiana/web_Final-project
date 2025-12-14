"""管理员评论相关路由配置"""
from django.urls import path
from .views import AdminCommentListView, AdminCommentDeleteView

urlpatterns = [
    path('', AdminCommentListView.as_view(), name='admin-comment-list'),
    path('<int:id>/delete', AdminCommentDeleteView.as_view(), name='admin-comment-delete'),
]