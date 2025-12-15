"""
AI助手应用API视图
"""

from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.decorators import api_view, permission_classes

from .models import KnowledgeBase, AIResponseLog
from .serializers import (
    KnowledgeBaseSerializer, 
    KnowledgeBaseListSerializer,
    AIResponseLogSerializer,
    AIQuestionSerializer,
    AITitleGenerateSerializer,
    AISummaryGenerateSerializer,
    AIExpandContentSerializer,
    AIEnhancedSearchSerializer
)
from .services import ai_assistant_service


@api_view(['POST'])
@permission_classes([AllowAny])
def ask_ai(request):
    """
    智能问答API
    
    请求格式：
    {
        "question": "用户输入的问题"
    }
    
    响应格式：
    {
        "success": true,
        "message": "获取回答成功",
        "data": {
            "answer": "AI生成的回答",
            "similarity": 0.9,
            "response_type": "knowledge_base",
            "processing_time": 100
        }
    }
    """
    serializer = AIQuestionSerializer(data=request.data)
    if serializer.is_valid():
        user_question = serializer.validated_data['question']
        answer_data = ai_assistant_service.get_knowledge_answer(user_question)
        return Response({
            "success": True,
            "message": "获取回答成功",
            "data": answer_data
        }, status=status.HTTP_200_OK)
    return Response({
        "success": False,
        "message": "请求参数错误",
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_title(request):
    """
    生成帖子标题API
    
    请求格式：
    {
        "content": "帖子内容"
    }
    
    响应格式：
    {
        "success": true,
        "message": "生成标题成功",
        "data": {
            "title": "生成的帖子标题"
        }
    }
    """
    serializer = AITitleGenerateSerializer(data=request.data)
    if serializer.is_valid():
        content = serializer.validated_data['content']
        title = ai_assistant_service.generate_post_title(content)
        return Response({
            "success": True,
            "message": "生成标题成功",
            "data": {
                "title": title
            }
        }, status=status.HTTP_200_OK)
    return Response({
        "success": False,
        "message": "请求参数错误",
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def generate_summary(request):
    """
    生成帖子摘要API
    
    请求格式：
    {
        "content": "帖子内容"
    }
    
    响应格式：
    {
        "success": true,
        "message": "生成摘要成功",
        "data": {
            "summary": "生成的帖子摘要"
        }
    }
    """
    serializer = AISummaryGenerateSerializer(data=request.data)
    if serializer.is_valid():
        content = serializer.validated_data['content']
        summary = ai_assistant_service.generate_post_summary(content)
        return Response({
            "success": True,
            "message": "生成摘要成功",
            "data": {
                "summary": summary
            }
        }, status=status.HTTP_200_OK)
    return Response({
        "success": False,
        "message": "请求参数错误",
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def expand_content(request):
    """
    根据关键词扩展帖子内容API
    
    请求格式：
    {
        "keywords": ["关键词1", "关键词2"],
        "category": "学习资料"
    }
    
    响应格式：
    {
        "success": true,
        "message": "扩展内容成功",
        "data": {
            "expanded_content": "扩展后的帖子内容"
        }
    }
    """
    serializer = AIExpandContentSerializer(data=request.data)
    if serializer.is_valid():
        keywords = serializer.validated_data['keywords']
        category = serializer.validated_data['category']
        expanded_content = ai_assistant_service.expand_post_content(keywords, category)
        return Response({
            "success": True,
            "message": "扩展内容成功",
            "data": {
                "expanded_content": expanded_content
            }
        }, status=status.HTTP_200_OK)
    return Response({
        "success": False,
        "message": "请求参数错误",
        "error": serializer.errors
    }, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([AllowAny])
def enhanced_search(request):
    """
    增强搜索API
    
    请求参数：
    - query: 搜索查询
    - category: 搜索分类（可选）
    
    响应格式：
    {
        "success": true,
        "message": "获取搜索建议成功",
        "data": {
            "original_query": "原始查询",
            "optimized_query": "优化后的查询",
            "suggestions": ["搜索建议1", "搜索建议2"],
            "search_terms": ["关键词1", "关键词2"]
        }
    }
    """
    query = request.query_params.get('query', '')
    category = request.query_params.get('category', None)
    
    if not query:
        return Response({
            "success": False,
            "message": "搜索查询不能为空",
            "error": {
                "query": ["搜索查询不能为空"]
            }
        }, status=status.HTTP_400_BAD_REQUEST)
    
    search_data = ai_assistant_service.enhanced_search(query, category)
    return Response({
        "success": True,
        "message": "获取搜索建议成功",
        "data": search_data
    }, status=status.HTTP_200_OK)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    """知识库管理API"""
    
    serializer_class = KnowledgeBaseSerializer
    permission_classes = [IsAuthenticated]
    queryset = KnowledgeBase.objects.all()
    
    def get_permissions(self):
        """根据请求方法设置权限"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_serializer_class(self):
        """根据请求方法选择序列化器"""
        if self.action == 'list':
            return KnowledgeBaseListSerializer
        return KnowledgeBaseSerializer
    
    def list(self, request, *args, **kwargs):
        """获取知识库列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取知识库列表成功",
            "data": serializer.data
        })
    
    def create(self, request, *args, **kwargs):
        """创建知识库条目"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "创建知识库条目成功",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        """获取知识库条目详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取知识库条目详情成功",
            "data": serializer.data
        })
    
    def update(self, request, *args, **kwargs):
        """更新知识库条目"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "更新知识库条目成功",
            "data": serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """删除知识库条目"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "删除知识库条目成功",
            "data": None
        })


class AIResponseLogViewSet(viewsets.ReadOnlyModelViewSet):
    """AI响应日志API"""
    
    serializer_class = AIResponseLogSerializer
    permission_classes = [IsAuthenticated]
    queryset = AIResponseLog.objects.all()
    
    def list(self, request, *args, **kwargs):
        """获取AI响应日志列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取AI响应日志列表成功",
            "data": serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """获取AI响应日志详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取AI响应日志详情成功",
            "data": serializer.data
        })
