"""
举报应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q

from .models import Report
from .serializers import (
    ReportSerializer, ReportCreateSerializer,
    ReportProcessSerializer
)


class ReportCreateView(generics.CreateAPIView):
    """创建举报视图"""
    
    serializer_class = ReportCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """处理创建举报请求"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 设置举报者
        report = serializer.save(reporter=request.user)
        
        return Response({
            "success": True,
            "message": "举报成功，我们将尽快处理",
            "data": ReportSerializer(report).data
        }, status=status.HTTP_201_CREATED)


class ReportListView(generics.ListAPIView):
    """举报列表视图（管理员）"""
    
    serializer_class = ReportSerializer
    permission_classes = [IsAdminUser]
    queryset = Report.objects.all()
    ordering = ['-created_at']
    
    def get_queryset(self):
        """获取过滤后的举报列表"""
        queryset = super().get_queryset()
        
        # 举报类型筛选
        type = self.request.query_params.get('type', None)
        if type:
            queryset = queryset.filter(type=type)
        
        # 处理状态筛选
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)
        
        # 目标类型筛选
        target_type = self.request.query_params.get('targetType', None)
        if target_type:
            queryset = queryset.filter(target_type=target_type)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取举报列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page_size = 10
        page_number = request.query_params.get('page', 1)
        
        try:
            page_number = int(page_number)
            if page_number < 1:
                page_number = 1
        except ValueError:
            page_number = 1
        
        # 计算偏移量
        offset = (page_number - 1) * page_size
        
        # 获取当前页数据
        page_queryset = queryset[offset:offset + page_size]
        
        # 序列化数据
        serializer = self.get_serializer(page_queryset, many=True)
        
        # 计算总页数
        total_items = queryset.count()
        total_pages = (total_items + page_size - 1) // page_size
        
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "reports": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })


class ReportProcessView(generics.UpdateAPIView):
    """处理举报视图（管理员）"""
    
    serializer_class = ReportProcessSerializer
    permission_classes = [IsAdminUser]
    queryset = Report.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """处理举报请求"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 设置处理人
        report = serializer.save(processed_by=request.user)
        
        # 执行处理动作
        report.process(
            action=serializer.validated_data['action'],
            notes=serializer.validated_data.get('notes', ''),
            processed_by=request.user
        )
        
        return Response({
            "success": True,
            "message": "举报已处理",
            "data": ReportSerializer(report).data
        })


class PostReportCreateView(generics.CreateAPIView):
    """举报帖子视图"""
    
    serializer_class = ReportCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, post_id, *args, **kwargs):
        """处理举报帖子请求"""
        request.data['target_type'] = 'post'
        request.data['target_id'] = post_id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 设置举报者
        report = serializer.save(reporter=request.user)
        
        return Response({
            "success": True,
            "message": "举报成功，我们将尽快处理",
            "data": ReportSerializer(report).data
        }, status=status.HTTP_201_CREATED)


class CommentReportCreateView(generics.CreateAPIView):
    """举报评论视图"""
    
    serializer_class = ReportCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, comment_id, *args, **kwargs):
        """处理举报评论请求"""
        request.data['target_type'] = 'comment'
        request.data['target_id'] = comment_id
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 设置举报者
        report = serializer.save(reporter=request.user)
        
        return Response({
            "success": True,
            "message": "举报成功，我们将尽快处理",
            "data": ReportSerializer(report).data
        }, status=status.HTTP_201_CREATED)