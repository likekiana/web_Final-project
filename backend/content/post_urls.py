"""帖子相关路由配置"""
from django.urls import path
from .views import PostListView, PostDetailView, PostCommentsView, PostCommentCreateView, CommentDetailView, PostPinView, PostUnpinView, FileUploadView
from likes.views import LikeToggleView

urlpatterns = [
    path('', PostListView.as_view(), name='post-list'),
    path('<int:id>/', PostDetailView.as_view(), name='post-detail'),
    path('<int:id>/like/', LikeToggleView.as_view(), name='post-like'),
    path('<int:post_id>/comments/', PostCommentsView.as_view(), name='post-comments'),
    path('<int:post_id>/comments/create/', PostCommentCreateView.as_view(), name='post-comment-create'),
    path('<int:post_id>/comments/<int:id>/', CommentDetailView.as_view(), name='post-comment-detail'),
    path('<int:post_id>/comments/<int:id>/like/', LikeToggleView.as_view(), name='comment-like'),
    # 文件上传路由 - 同时支持带斜杠和不带斜杠的URL
    path('upload', FileUploadView.as_view(), name='file-upload'),
    path('upload/', FileUploadView.as_view(), name='file-upload-slash'),
    # 管理员功能
    path('<int:id>/pin/', PostPinView.as_view(), name='post-pin'),
    path('<int:id>/unpin/', PostUnpinView.as_view(), name='post-unpin')
]
