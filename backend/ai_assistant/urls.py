"""
AI助手应用URL配置
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    ask_ai,
    generate_title,
    generate_summary,
    expand_content,
    enhanced_search,
    KnowledgeBaseViewSet,
    AIResponseLogViewSet
)

# 创建路由实例
router = DefaultRouter()

# 注册视图集
router.register(r'knowledge-base', KnowledgeBaseViewSet, basename='knowledge-base')
router.register(r'response-logs', AIResponseLogViewSet, basename='response-logs')

# 定义API路由
urlpatterns = [
    # 智能问答
    path('ask/', ask_ai, name='ask-ai'),
    
    # 帖子创作辅助
    path('generate-title/', generate_title, name='generate-title'),
    path('generate-summary/', generate_summary, name='generate-summary'),
    path('expand-content/', expand_content, name='expand-content'),
    
    # 智能搜索增强
    path('enhanced-search/', enhanced_search, name='enhanced-search'),
    
    # 视图集路由
    path('', include(router.urls)),
]
