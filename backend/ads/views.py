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
        
        # 只显示已发布的广告
        queryset = queryset.filter(status='active')
        
        # 只显示当前有效的广告（开始时间<=现在<=结束时间）
        from django.utils import timezone
        now = timezone.now()
        queryset = queryset.filter(
            (Q(start_date__isnull=True) | Q(start_date__lte=now)) & 
            (Q(end_date__isnull=True) | Q(end_date__gte=now))
        )
        
        return queryset
    
    def list(self, request, *args, **kwargs):
        """获取广告列表"""
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取成功",
                "data": {
                    "advertisements": serializer.data,
                    "pagination": {
                        "currentPage": self.request.query_params.get('page', 1),
                        "totalPages": self.paginator.num_pages,
                        "totalItems": self.paginator.count,
                        "pageSize": self.paginator.per_page
                    }
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取成功",
            "data": {
                "advertisements": serializer.data,
                "pagination": {
                    "currentPage": 1,
                    "totalPages": 1,
                    "totalItems": len(serializer.data),
                    "pageSize": len(serializer.data)
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
        
        serializer = self.get_serializer(
            instance, 
            data={'status': request.data['status']}, 
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        advertisement = serializer.save()
        
        message = "广告已通过审核" if request.data['status'] == 'active' else "广告已拒绝"
        
        return Response({
            "success": True,
            "message": message,
            "data": AdvertisementSerializer(advertisement).data
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
