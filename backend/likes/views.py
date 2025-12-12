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
    
    def post(self, request, target_type, target_id):
        """处理点赞/取消点赞请求"""
        # 验证目标类型
        if target_type not in ['post', 'comment']:
            return Response({
                "success": False,
                "message": "无效的目标类型",
                "error": {
                    "code": 400,
                    "details": "目标类型必须是post或comment"
                }
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # 获取目标对象
        if target_type == 'post':
            target = get_object_or_404(Post, id=target_id)
        else:
            target = get_object_or_404(Comment, id=target_id)
        
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