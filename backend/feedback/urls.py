"""
功能反馈URL配置
"""

from django.urls import path
from .views import (
    FeedbackCreateView,
    FeedbackListView,
    FeedbackProcessView,
    UserFeedbackListView,
    FeedbackDetailView
)

urlpatterns = [
    # 用户反馈URL
    path('feedbacks/', FeedbackCreateView.as_view(), name='feedback-create'),
    path('feedbacks/user/', UserFeedbackListView.as_view(), name='user-feedback-list'),
    path('feedbacks/<int:id>/', FeedbackDetailView.as_view(), name='feedback-detail'),
    
    # 管理员反馈管理URL
    path('admin/feedbacks/', FeedbackListView.as_view(), name='admin-feedback-list'),
    path('admin/feedbacks/<int:id>/process/', FeedbackProcessView.as_view(), name='admin-feedback-process'),
]
