"""
关注应用序列化器
"""

from rest_framework import serializers
from .models import Follow
from accounts.serializers import UserProfileSerializer


class FollowSerializer(serializers.ModelSerializer):
    """关注序列化器"""
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'following', 'created_at']
        read_only_fields = ['follower', 'created_at']


class FollowUserSerializer(serializers.ModelSerializer):
    """带有用户详情的关注序列化器"""
    following = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'following', 'created_at']
        read_only_fields = ['following', 'created_at']


class FollowerSerializer(serializers.ModelSerializer):
    """带有关注者详情的关注序列化器"""
    follower = UserProfileSerializer(read_only=True)
    
    class Meta:
        model = Follow
        fields = ['id', 'follower', 'created_at']
        read_only_fields = ['follower', 'created_at']
