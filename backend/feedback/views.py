"""
功能反馈视图函数
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.db.models import Q

from .models import Feedback
from .serializers import (
    FeedbackCreateSerializer,
    FeedbackSerializer,
    FeedbackProcessSerializer
)


class FeedbackCreateView(generics.CreateAPIView):
    """创建反馈视图"""
    
    serializer_class = FeedbackCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """创建反馈"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 创建反馈并关联当前用户
        feedback = serializer.save(user=request.user)
        
        return Response({
            "success": True,
            "message": "反馈提交成功，感谢您的建议！",
            "data": {
                "id": feedback.id,
                "type": feedback.type,
                "title": feedback.title,
                "status": feedback.status,
                "created_at": feedback.created_at
            }
        }, status=status.HTTP_201_CREATED)


class FeedbackListView(generics.ListAPIView):
    """获取反馈列表视图（管理员）"""
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Feedback.objects.all()
    
    def get_queryset(self):
        """获取过滤后的反馈列表"""
        queryset = super().get_queryset()
        
        # 类型筛选
        type = self.request.query_params.get('type', None)
        if type:
            queryset = queryset.filter(type=type)
        
        # 状态筛选
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # 关键词搜索
        keyword = self.request.query_params.get('keyword', None)
        if keyword:
            queryset = queryset.filter(
                Q(title__icontains=keyword) | 
                Q(content__icontains=keyword) |
                Q(reply__icontains=keyword)
            )
        
        return queryset.order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取反馈列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取反馈列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取反馈列表成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class FeedbackProcessView(generics.UpdateAPIView):
    """处理反馈视图（管理员）"""
    
    serializer_class = FeedbackProcessSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = Feedback.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """处理反馈"""
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # 更新反馈状态和处理人
        feedback = serializer.save(
            processed_by=request.user,
            processed_at=serializer.validated_data.get('processed_at', None)
        )
        
        return Response({
            "success": True,
            "message": "反馈处理成功",
            "data": FeedbackSerializer(feedback).data
        }, status=status.HTTP_200_OK)


class UserFeedbackListView(generics.ListAPIView):
    """获取当前用户的反馈列表"""
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户的反馈列表"""
        return Feedback.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取反馈列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取反馈列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取反馈列表成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class FeedbackDetailView(generics.RetrieveAPIView):
    """获取反馈详情视图"""
    
    serializer_class = FeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Feedback.objects.all()
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        """获取反馈详情"""
        instance = self.get_object()
        
        # 检查权限：只有管理员或反馈人才能查看详情
        if instance.user != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权查看该反馈",
                "error": {
                    "code": 403,
                    "details": "您没有权限查看该反馈"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取反馈详情成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
