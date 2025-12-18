"""
积分系统URL配置
"""

from django.urls import path
from . import views

# 用户积分相关URL
urlpatterns = [
    # 获取或更新当前用户积分信息
    path('info/', views.PointsInfoView.as_view(), name='points-info'),
    # 获取当前用户积分记录
    path('records/', views.PointsRecordsView.as_view(), name='points-records'),
    # 根据事件奖励积分
    path('award/', views.PointsAwardView.as_view(), name='points-award'),
    # 扣除积分
    path('deduct/', views.PointsDeductView.as_view(), name='points-deduct'),
    # 积分排行榜
    path('rank/', views.PointsRankView.as_view(), name='points-rank'),
]

# 管理员积分相关URL
admin_urlpatterns = [
    # 获取或更新指定用户积分信息
    path('users/<int:user_id>/info/', views.AdminPointsInfoView.as_view(), name='admin-points-info'),
    # 获取所有用户积分记录
    path('records/all/', views.AdminPointsRecordsView.as_view(), name='admin-points-records'),
    # 批量更新用户积分
    path('batch/update/', views.AdminPointsBatchUpdateView.as_view(), name='admin-points-batch-update'),
    # 积分规则管理
    path('rules/', views.PointsRuleListView.as_view(), name='admin-points-rules'),
    path('rules/<int:id>/', views.PointsRuleDetailView.as_view(), name='admin-points-rule-detail'),
]