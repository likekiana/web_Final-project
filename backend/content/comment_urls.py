"""评论相关路由配置"""
from django.urls import path
from .views import CommentListView, CommentDetailView

urlpatterns = [
    path('', CommentListView.as_view(), name='comment-list'),
    path('<int:id>/', CommentDetailView.as_view(), name='comment-detail'),
]
