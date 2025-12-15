"""举报管理应用管理员路由配置"""
from django.urls import path
from .views import ReportListView, ReportProcessView

urlpatterns = [
    path('', ReportListView.as_view(), name='admin-report-list'),
    path('<int:id>/', ReportProcessView.as_view(), name='admin-report-process'),
]