"""
内容管理应用路由配置
"""

from django.urls import path
from .views import (
    CategoryListView, CategoryDetailView,
    PostListView, PostDetailView,
    CommentListView, CommentDetailView,
    PostCommentsView, PostCommentCreateView
)
from likes.views import LikeToggleView

urlpatterns = [
    # 板块相关路由 - 当访问/api/categories/时匹配
    path('', CategoryListView.as_view(), name='category-list'),
    path('<int:id>', CategoryDetailView.as_view(), name='category-detail'),
    
    # 帖子相关路由 - 当访问/api/posts/时匹配
    path('', PostListView.as_view(), name='post-list-create'),
    path('posts', PostListView.as_view(), name='post-list'),
    path('posts/<int:id>', PostDetailView.as_view(), name='post-detail'),
    path('posts/<int:id>/like', LikeToggleView.as_view(), name='post-like'),
    
    # 评论相关路由
    path('comments', CommentListView.as_view(), name='comment-list'),
    path('comments/<int:id>', CommentDetailView.as_view(), name='comment-detail'),
    
    # 帖子评论相关路由
    path('posts/<int:post_id>/comments', PostCommentsView.as_view(), name='post-comments'),
    path('posts/<int:post_id>/comments/create', PostCommentCreateView.as_view(), name='post-comment-create'),
    path('posts/<int:post_id>/comments/<int:id>/like', LikeToggleView.as_view(), name='comment-like')
]