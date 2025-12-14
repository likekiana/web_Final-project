"""
关注应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Follow
from .serializers import FollowSerializer, FollowUserSerializer, FollowerSerializer
from accounts.models import User


class FollowToggleView(generics.GenericAPIView):
    """关注/取消关注视图"""
    
    permission_classes = [IsAuthenticated]
    
    def post(self, request, user_id):
        """处理关注/取消关注请求"""
        # 获取被关注用户对象
        following_user = get_object_or_404(User, id=user_id)
        
        # 检查是否是关注自己
        if request.user.id == following_user.id:
            return Response({
                "success": False,
                "message": "不能关注自己",
                "error": {
                    "code": 400,
                    "details": "不能关注自己"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 检查是否已关注
        follow, created = Follow.objects.get_or_create(
            follower=request.user,
            following=following_user
        )
        
        if created:
            # 关注成功
            return Response({
                "success": True,
                "message": "关注成功",
                "data": {
                    "is_following": True
                }
            }, status=status.HTTP_201_CREATED)
        else:
            # 已关注，取消关注
            follow.delete()
            return Response({
                "success": True,
                "message": "取消关注成功",
                "data": {
                    "is_following": False
                }
            }, status=status.HTTP_200_OK)


class FollowingListView(generics.ListAPIView):
    """获取用户关注列表视图"""
    
    serializer_class = FollowUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户关注的用户列表"""
        return Follow.objects.filter(
            follower=self.request.user
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取关注列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取关注列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取关注列表成功",
            "data": serializer.data
        })


class FollowersListView(generics.ListAPIView):
    """获取用户粉丝列表视图"""
    
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取当前用户的粉丝列表"""
        return Follow.objects.filter(
            following=self.request.user
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取粉丝列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取粉丝列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取粉丝列表成功",
            "data": serializer.data
        })


class FollowCheckView(generics.GenericAPIView):
    """检查是否已关注某用户视图"""
    
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id):
        """检查是否已关注某用户"""
        # 检查是否已关注
        is_following = Follow.objects.filter(
            follower=request.user,
            following_id=user_id
        ).exists()
        
        return Response({
            "success": True,
            "message": "检查关注状态成功",
            "data": {
                "is_following": is_following
            }
        }, status=status.HTTP_200_OK)


class OtherUserFollowingListView(generics.ListAPIView):
    """获取其他用户关注列表视图"""
    
    serializer_class = FollowUserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取指定用户关注的用户列表"""
        user_id = self.kwargs.get('user_id')
        return Follow.objects.filter(
            follower_id=user_id
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取其他用户关注列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取用户关注列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取用户关注列表成功",
            "data": serializer.data
        })


class OtherUserFollowersListView(generics.ListAPIView):
    """获取其他用户粉丝列表视图"""
    
    serializer_class = FollowerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """获取指定用户的粉丝列表"""
        user_id = self.kwargs.get('user_id')
        return Follow.objects.filter(
            following_id=user_id
        ).order_by('-created_at')
    
    def list(self, request, *args, **kwargs):
        """获取其他用户粉丝列表"""
        queryset = self.filter_queryset(self.get_queryset())
        
        # 处理分页
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response({
                "success": True,
                "message": "获取用户粉丝列表成功",
                "data": serializer.data
            })
        
        serializer = self.get_serializer(queryset, many=True)
        return Response({
            "success": True,
            "message": "获取用户粉丝列表成功",
            "data": serializer.data
        })
