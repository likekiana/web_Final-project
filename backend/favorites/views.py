"""
收藏应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Favorite
from .serializers import FavoriteSerializer, FavoritePostSerializer
from content.models import Post


class FavoriteToggleView(generics.GenericAPIView):
    """收藏/取消收藏视图"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, post_id):
        """处理收藏/取消收藏请求"""
        # 获取帖子对象
        post = get_object_or_404(Post, id=post_id, status='normal')
        
        # 检查是否已收藏
        favorite, created = Favorite.objects.get_or_create(
            user=request.user,
            post=post
        )
        
        if created:
            # 收藏成功
            return Response({
                "success": True,
                "message": "收藏成功",
                "data": {
                    "is_favorited": True
                }
            }, status=status.HTTP_201_CREATED)
        else:
            # 已收藏，取消收藏
            favorite.delete()
            return Response({
                "success": True,
                "message": "取消收藏成功",
                "data": {
                    "is_favorited": False
                }
            }, status=status.HTTP_200_OK)


class FavoriteListView(generics.ListAPIView):
    """获取用户收藏列表视图"""
    
    serializer_class = FavoritePostSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户的收藏列表"""
        return Favorite.objects.filter(
            user=self.request.user
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取收藏列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            paginated_response = self.get_paginated_response(serializer.data)
            
            # 自定义分页响应格式
            return Response({
                "success": True,
                "message": "获取收藏列表成功",
                "data": {
                    "results": paginated_response.data['results'],
                    "count": paginated_response.data['count'],
                    "next": paginated_response.data['next'],
                    "previous": paginated_response.data['previous']
                }
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取收藏列表成功",
            "data": serializer.data
        })


class FavoriteCheckView(generics.GenericAPIView):
    """检查帖子是否已被收藏视图"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, post_id):
        """检查帖子是否已被收藏"""
        # 检查是否已收藏
        is_favorited = Favorite.objects.filter(
            user=request.user,
            post_id=post_id
        ).exists()
        
        return Response({
            "success": True,
            "message": "检查收藏状态成功",
            "data": {
                "is_favorited": is_favorited
            }
        }, status=status.HTTP_200_OK)
