"""
广告应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from django.db.models import Q

from .models import Advertisement
from .serializers import (
    AdvertisementSerializer, 
    AdvertisementCreateSerializer,
    AdvertisementUpdateSerializer
)


class AdvertisementListView(generics.ListAPIView):
    """广告列表视图"""
    
    serializer_class = AdvertisementSerializer
    permission_classes = []
    queryset = Advertisement.objects.all()
    ordering = ['-created_at']
    
    def get_queryset(self):
        """获取过滤后的广告列表"""
        queryset = super().get_queryset()
        
        # 检查请求路径，判断是否为管理员访问
        if 'admin' not in self.request.path:
            # 普通用户只显示已发布的广告
            queryset = queryset.filter(status='active')
            
            # 普通用户只显示当前有效的广告（开始时间<=现在<=结束时间）
            from django.utils import timezone
            now = timezone.now()
            queryset = queryset.filter(
                (Q(start_date__isnull=True) | Q(start_date__lte=now)) & 
                (Q(end_date__isnull=True) | Q(end_date__gte=now))
            )
        else:
            # 管理员可以查看所有广告，支持搜索和状态筛选
            # 搜索关键词
            search = self.request.query_params.get('search', None)
            if search:
                queryset = queryset.filter(
                    Q(title__icontains=search) | 
                    Q(content__icontains=search) | 
                    Q(merchant__username__icontains=search)
                )
            
            # 状态筛选
            status = self.request.query_params.get('status', None)
            if status:
                queryset = queryset.filter(status=status)
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取广告列表"""
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
                "advertisements": serializer.data,
                "pagination": {
                    "currentPage": page_number,
                    "totalPages": total_pages,
                    "totalItems": total_items,
                    "pageSize": page_size
                }
            }
        })


class AdvertisementDetailView(generics.RetrieveAPIView):
    """广告详情视图"""
    
    serializer_class = AdvertisementSerializer
    permission_classes = []
    queryset = Advertisement.objects.all()
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        """获取广告详情"""
        instance = self.get_object()
        
        # 增加浏览量
        instance.increment_views()
        
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": serializer.data
        })


class AdvertisementCreateView(generics.CreateAPIView):
    """创建广告视图"""
    
    serializer_class = AdvertisementCreateSerializer
    permission_classes = [IsAuthenticated]
    
    def create(self, request, *args, **kwargs):
        """处理创建广告请求"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 设置发布商户
        advertisement = serializer.save(merchant=request.user)
        
        return Response({
            "success": True,
            "message": "广告创建成功，等待审核",
            "data": AdvertisementSerializer(advertisement).data
        }, status=status.HTTP_201_CREATED)


class AdvertisementUpdateView(generics.UpdateAPIView):
    """更新广告视图"""
    
    serializer_class = AdvertisementUpdateSerializer
    permission_classes = [IsAuthenticated]
    queryset = Advertisement.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """处理更新广告请求"""
        instance = self.get_object()
        
        # 检查权限：只有广告发布者或管理员可以更新
        if instance.merchant != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限更新此广告",
                "error": {
                    "code": 403,
                    "details": "无权限更新此广告"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        advertisement = serializer.save()
        
        return Response({
            "success": True,
            "message": "广告已更新",
            "data": AdvertisementSerializer(advertisement).data
        })


class AdvertisementDeleteView(generics.DestroyAPIView):
    """删除广告视图"""
    
    permission_classes = [IsAuthenticated]
    queryset = Advertisement.objects.all()
    lookup_field = 'id'
    
    def destroy(self, request, *args, **kwargs):
        """处理删除广告请求"""
        instance = self.get_object()
        
        # 检查权限：只有广告发布者或管理员可以删除
        if instance.merchant != request.user and not request.user.is_staff:
            return Response({
                "success": False,
                "message": "无权限删除此广告",
                "error": {
                    "code": 403,
                    "details": "无权限删除此广告"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        instance.delete()
        return Response({
            "success": True,
            "message": "广告已删除",
            "data": None
        })


class AdvertisementApproveView(generics.UpdateAPIView):
    """审核广告视图（管理员）"""
    
    serializer_class = AdvertisementUpdateSerializer
    permission_classes = [IsAdminUser]
    queryset = Advertisement.objects.all()
    lookup_field = 'id'
    
    def update(self, request, *args, **kwargs):
        """处理审核广告请求"""
        instance = self.get_object()
        
        # 只允许更新状态
        if 'status' not in request.data:
            return Response({
                "success": False,
                "message": "请提供审核结果",
                "error": {
                    "code": 400,
                    "details": "请提供审核结果"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 调用模型的approve或reject方法
        if request.data['status'] == 'active':
            instance.approve(request.user)
        elif request.data['status'] == 'rejected':
            instance.reject(request.user, request.data.get('review_notes', ''))
        else:
            # 更新其他状态
            instance.status = request.data['status']
            instance.save(update_fields=['status'])
        
        message = "广告已通过审核" if request.data['status'] == 'active' else "广告已拒绝"
        
        return Response({
            "success": True,
            "message": message,
            "data": AdvertisementSerializer(instance).data
        })


class AdvertisementClickView(generics.GenericAPIView):
    """广告点击统计视图"""
    
    permission_classes = []
    
    def post(self, request, advertisement_id):
        """处理广告点击请求"""
        advertisement = generics.get_object_or_404(Advertisement, id=advertisement_id)
        
        # 增加点击量
        advertisement.increment_clicks()
        
        return Response({
            "success": True,
            "message": "点击统计成功"
        })
