"""
通知应用视图
"""

from rest_framework import status, generics, viewsets
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q

from .models import Notification
from .serializers import NotificationSerializer, NotificationListSerializer


class NotificationViewSet(viewsets.ModelViewSet):
    """通知视图集"""
    
    serializer_class = NotificationListSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get', 'patch', 'delete']
    
    def get_queryset(self):
        """获取当前用户的通知列表"""
        return Notification.objects.filter(
            recipient=self.request.user
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取通知列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取通知列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取通知列表成功",
            "data": serializer.data
        })
    
    def retrieve(self, request, *args, **kwargs):
        """获取通知详情"""
        instance = self.get_object()
        # 标记为已读
        instance.mark_as_read()
        serializer = NotificationSerializer(instance)
        return Response({
            "success": True,
            "message": "获取通知详情成功",
            "data": serializer.data
        })
    
    def partial_update(self, request, *args, **kwargs):
        """更新通知状态"""
        instance = self.get_object()
        
        # 只允许标记为已读
        instance.mark_as_read()
        
        serializer = NotificationSerializer(instance)
        return Response({
            "success": True,
            "message": "通知已标记为已读",
            "data": serializer.data
        })
    
    def destroy(self, request, *args, **kwargs):
        """删除通知"""
        instance = self.get_object()
        instance.delete()
        return Response({
            "success": True,
            "message": "通知已删除",
            "data": None
        }, status=status.HTTP_200_OK)


class NotificationMarkAllReadView(generics.GenericAPIView):
    """标记所有通知为已读"""
    
    permission_classes = [IsAuthenticated]
    
    def patch(self, request):
        """标记所有通知为已读"""
        # 获取所有未读通知
        notifications = Notification.objects.filter(
            recipient=request.user,
            status=Notification.Status.UNREAD
        )
        
        # 标记为已读
        from datetime import datetime
        notifications.update(
            status=Notification.Status.READ,
            read_at=datetime.now()
        )
        
        return Response({
            "success": True,
            "message": "所有通知已标记为已读",
            "data": {
                "count": notifications.count()
            }
        }, status=status.HTTP_200_OK)


class NotificationCountView(generics.GenericAPIView):
    """获取未读通知数量"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """获取未读通知数量"""
        # 获取未读通知数量
        unread_count = Notification.objects.filter(
            recipient=request.user,
            status=Notification.Status.UNREAD
        ).count()
        
        return Response({
            "success": True,
            "message": "获取未读通知数量成功",
            "data": {
                "unread_count": unread_count
            }
        }, status=status.HTTP_200_OK)