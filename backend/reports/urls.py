"""
举报应用路由配置
"""

from django.urls import path
from .views import (
    ReportCreateView, ReportListView,
    ReportProcessView, PostReportCreateView,
    CommentReportCreateView
)

urlpatterns = [
    # 举报管理路由
    path('', ReportCreateView.as_view(), name='report-create'),
    
    # 帖子举报路由
    path('posts/<int:post_id>/report', PostReportCreateView.as_view(), name='post-report'),
    
    # 评论举报路由
    path('comments/<int:comment_id>/report', CommentReportCreateView.as_view(), name='comment-report'),
]
