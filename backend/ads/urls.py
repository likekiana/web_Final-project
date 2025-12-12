"""
广告应用URL配置
"""

from django.urls import path
from .views import (
    AdvertisementListView,
    AdvertisementDetailView,
    AdvertisementCreateView,
    AdvertisementUpdateView,
    AdvertisementDeleteView,
    AdvertisementApproveView,
    AdvertisementClickView
)

urlpatterns = [
    # 广告列表
    path('advertisements/', AdvertisementListView.as_view(), name='advertisement_list'),
    # 广告详情
    path('advertisements/<int:id>/', AdvertisementDetailView.as_view(), name='advertisement_detail'),
    # 创建广告
    path('advertisements/create/', AdvertisementCreateView.as_view(), name='advertisement_create'),
    # 更新广告
    path('advertisements/<int:id>/update/', AdvertisementUpdateView.as_view(), name='advertisement_update'),
    # 删除广告
    path('advertisements/<int:id>/delete/', AdvertisementDeleteView.as_view(), name='advertisement_delete'),
    # 审核广告
    path('advertisements/<int:id>/approve/', AdvertisementApproveView.as_view(), name='advertisement_approve'),
    # 广告点击统计
    path('advertisements/<int:advertisement_id>/click/', AdvertisementClickView.as_view(), name='advertisement_click'),
]
