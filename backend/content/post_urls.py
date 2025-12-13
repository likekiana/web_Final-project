"""帖子相关路由配置"""
from django.urls import path
from .views import PostListView, PostDetailView, PostCommentsView, PostCommentCreateView
from likes.views import LikeToggleView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:id>', PostDetailView.as_view(), name='post-detail'),
    path('<int:id>/like', LikeToggleView.as_view(), name='post-like'),
    path('<int:post_id>/comments', PostCommentsView.as_view(), name='post-comments'),
    path('<int:post_id>/comments/create', PostCommentCreateView.as_view(), name='post-comment-create'),
    path('<int:post_id>/comments/<int:id>/like', LikeToggleView.as_view(), name='comment-like')
]
