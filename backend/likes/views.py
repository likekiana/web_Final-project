"""
点赞应用视图
"""

from rest_framework import status, generics
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404

from .models import Like
from content.models import Post, Comment


class LikeToggleView(generics.GenericAPIView):
    """点赞/取消点赞视图"""
    
    permission_classes = [IsAuthenticated]
    
    def get_target_info(self, id, post_id=None):
        """获取目标类型和目标对象"""
        # 确定目标类型和目标ID
        if post_id is not None:
            # 评论点赞：/posts/<post_id>/comments/<id>/like
            target_type = 'comment'
            target_id = id
        else:
            # 帖子点赞：/posts/<id>/like
            target_type = 'post'
            target_id = id
        
        # 获取目标对象
        if target_type == 'post':
            target = get_object_or_404(Post, id=target_id)
        else:
            target = get_object_or_404(Comment, id=target_id)
        
        return target_type, target_id, target
    
    def post(self, request, id, post_id=None):
        """处理点赞请求"""
        target_type, target_id, target = self.get_target_info(id, post_id)
        
        # 检查是否已点赞
        like, created = Like.objects.get_or_create(
            user=request.user,
            target_type=target_type,
            target_id=target_id
        )
        
        is_liked = True
        
        if not created:
            # 已点赞，取消点赞
            like.delete()
            target.decrement_likes_count()
            is_liked = False
        else:
            # 未点赞，添加点赞
            target.increment_likes_count()
        
        # 重新获取目标对象，获取最新的点赞数
        if target_type == 'post':
            target = get_object_or_404(Post, id=target_id)
        else:
            target = get_object_or_404(Comment, id=target_id)
        
        return Response({
            "success": True,
            "message": "操作成功",
            "data": {
                "isLiked": is_liked,
                "likesCount": target.likes_count
            }
        }, status=status.HTTP_200_OK)
    
    def delete(self, request, id, post_id=None):
        """处理取消点赞请求"""
        target_type, target_id, target = self.get_target_info(id, post_id)
        
        # 检查是否已点赞
        try:
            like = Like.objects.get(
                user=request.user,
                target_type=target_type,
                target_id=target_id
            )
            # 已点赞，取消点赞
            like.delete()
            target.decrement_likes_count()
            is_liked = False
        except Like.DoesNotExist:
            # 未点赞，不需要操作
            is_liked = False
        
        # 重新获取目标对象，获取最新的点赞数
        if target_type == 'post':
            target = get_object_or_404(Post, id=target_id)
        else:
            target = get_object_or_404(Comment, id=target_id)
        
        return Response({
            "success": True,
            "message": "操作成功",
            "data": {
                "isLiked": is_liked,
                "likesCount": target.likes_count
            }
        }, status=status.HTTP_200_OK)