"""
收藏应用序列化器
"""

from rest_framework import serializers
from .models import Favorite
from content.serializers import PostListSerializer


class FavoriteSerializer(serializers.ModelSerializer):
    """收藏序列化器"""
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'post', 'created_at']
        read_only_fields = ['user', 'created_at']


class FavoritePostSerializer(serializers.ModelSerializer):
    """带有帖子详情的收藏序列化器"""
    post = PostListSerializer(read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'post', 'created_at']
        read_only_fields = ['post', 'created_at']
