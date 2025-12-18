"""
积分系统视图函数
"""

from rest_framework import status, generics, permissions
from rest_framework.response import Response
from django.db.models import Q

from .models import PointsInfo, PointsRule, PointsRecord
from .serializers import (
    PointsInfoSerializer,
    PointsRecordSerializer,
    PointsRuleSerializer,
    PointsAwardSerializer,
    PointsDeductSerializer,
    PointsBatchUpdateSerializer,
    PointsRankSerializer
)
from .services import points_service


class PointsInfoView(generics.RetrieveUpdateAPIView):
    """获取或更新当前用户积分信息"""
    
    serializer_class = PointsInfoSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        """获取当前用户的积分信息"""
        return points_service.get_or_create_points_info(self.request.user)
    
    def retrieve(self, request, *args, **kwargs):
        """获取积分信息"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取积分信息成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """更新积分信息（仅管理员可用）"""
        if not request.user.is_staff:
            return Response({
                "success": False,
                "message": "只有管理员才能更新积分信息",
                "error": {
                    "code": 403,
                    "details": "只有管理员才能更新积分信息"
                }
            }, status=status.HTTP_403_FORBIDDEN)
        
        return super().update(request, *args, **kwargs)


class PointsRecordsView(generics.ListAPIView):
    """获取当前用户积分记录"""
    
    serializer_class = PointsRecordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户的积分记录"""
        return PointsRecord.objects.filter(user=self.request.user).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取积分记录列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取积分记录成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取积分记录成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class PointsAwardView(generics.GenericAPIView):
    """奖励积分视图"""
    
    serializer_class = PointsAwardSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """奖励积分"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 奖励积分
        result = points_service.award_points(
            request.user,
            serializer.validated_data['event'],
            serializer.validated_data.get('amount'),
            serializer.validated_data.get('reason')
        )
        
        if result['success']:
            return Response({
                "success": True,
                "message": result['message'],
                "data": PointsInfoSerializer(result['points_info']).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "message": result['message']
            }, status=status.HTTP_400_BAD_REQUEST)


class PointsDeductView(generics.GenericAPIView):
    """扣除积分视图"""
    
    serializer_class = PointsDeductSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request, *args, **kwargs):
        """扣除积分"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 扣除积分
        result = points_service.deduct_points(
            request.user,
            serializer.validated_data['amount'],
            serializer.validated_data['reason']
        )
        
        if result['success']:
            return Response({
                "success": True,
                "message": result['message'],
                "data": PointsInfoSerializer(result['points_info']).data
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                "success": False,
                "message": result['message']
            }, status=status.HTTP_400_BAD_REQUEST)


class PointsRankView(generics.ListAPIView):
    """积分排行榜视图"""
    
    serializer_class = PointsRankSerializer
    permission_classes = []
    
    def get_queryset(self):
        """获取积分排行榜"""
        return PointsInfo.objects.order_by('-points')[:100]  # 只显示前100名
    
    def list(self, request, *args, **kwargs):
        """获取积分排行榜"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取积分排行榜成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


# 管理员视图

class AdminPointsInfoView(generics.RetrieveUpdateAPIView):
    """管理员获取或更新指定用户积分信息"""
    
    serializer_class = PointsInfoSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = PointsInfo.objects.all()
    lookup_field = 'user_id'
    
    def retrieve(self, request, *args, **kwargs):
        """获取指定用户积分信息"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取用户积分信息成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """更新指定用户积分信息"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "更新用户积分信息成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class AdminPointsRecordsView(generics.ListAPIView):
    """管理员获取所有用户积分记录"""
    
    serializer_class = PointsRecordSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = PointsRecord.objects.all().order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取积分记录列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取积分记录成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取积分记录成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)


class AdminPointsBatchUpdateView(generics.GenericAPIView):
    """管理员批量更新用户积分"""
    
    serializer_class = PointsBatchUpdateSerializer
    permission_classes = [permissions.IsAdminUser]
    
    def post(self, request, *args, **kwargs):
        """批量更新用户积分"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # 批量更新积分
        result = points_service.batch_update_points(
            serializer.validated_data['user_ids'],
            serializer.validated_data['points_change'],
            serializer.validated_data['reason'],
            request.user  # 操作人
        )
        
        return Response({
            "success": True,
            "message": result['message'],
            "data": {
                "success_count": result['success_count'],
                "failed_count": result['failed_count'],
                "failed_users": result['failed_users']
            }
        }, status=status.HTTP_200_OK)


class PointsRuleListView(generics.ListCreateAPIView):
    """积分规则列表视图"""
    
    serializer_class = PointsRuleSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = PointsRule.objects.all().order_by('-is_enabled', 'event')
    
    def list(self, request, *args, **kwargs):
        """获取积分规则列表"""
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取积分规则列表成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def create(self, request, *args, **kwargs):
        """创建积分规则"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response({
            "success": True,
            "message": "创建积分规则成功",
            "data": serializer.data
        }, status=status.HTTP_201_CREATED)


class PointsRuleDetailView(generics.RetrieveUpdateDestroyAPIView):
    """积分规则详情视图"""
    
    serializer_class = PointsRuleSerializer
    permission_classes = [permissions.IsAdminUser]
    queryset = PointsRule.objects.all()
    lookup_field = 'id'
    
    def retrieve(self, request, *args, **kwargs):
        """获取积分规则详情"""
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response({
            "success": True,
            "message": "获取积分规则详情成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def update(self, request, *args, **kwargs):
        """更新积分规则"""
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response({
            "success": True,
            "message": "更新积分规则成功",
            "data": serializer.data
        }, status=status.HTTP_200_OK)
    
    def destroy(self, request, *args, **kwargs):
        """删除积分规则"""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            "success": True,
            "message": "删除积分规则成功"
        }, status=status.HTTP_204_NO_CONTENT)
