from django.urls import path
from .views import BrowsingHistoryListAPIView, BrowsingHistoryClearAPIView

app_name = 'browsing_history'

urlpatterns = [
    # 获取用户浏览历史列表
    path('history/', BrowsingHistoryListAPIView.as_view(), name='browsing_history_list'),
    # 清空用户浏览历史
    path('history/clear/', BrowsingHistoryClearAPIView.as_view(), name='browsing_history_clear'),
]
