"""
campus_forum URL Configuration
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

# 根URL配置
urlpatterns = [
    # 管理员后台
    path('admin/', admin.site.urls),
    
    # JWT认证
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),
    
    # 应用路由
    path('api/auth/', include('accounts.urls')),
    path('api/users/', include('accounts.urls')),
    path('api/categories/', include('content.category_urls')),
    path('api/posts/', include('content.post_urls')),
    path('api/comments/', include('content.comment_urls')),
    path('api/likes/', include('likes.urls')),
    path('api/favorites/', include('favorites.urls')),
    path('api/follows/', include('follows.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/admin/', include('accounts.urls')),
    path('api/admin/posts/', include('content.post_urls')),
    path('api/admin/comments/', include('content.admin_comment_urls')),
    path('api/admin/categories/', include('content.category_urls')),
    path('api/admin/ads/', include('ads.urls')),
    path('api/admin/reports/', include('reports.admin_report_urls')),
    path('api/ads/', include('ads.urls')),
    path('api/history/', include('browsing_history.urls')),
    path('api/notifications/', include('notifications.urls')),
    path('api/messages/', include('user_messages.urls')),
    # AI助手路由
    path('api/ai/', include('ai_assistant.urls')),
]

# 静态文件和媒体文件配置
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
