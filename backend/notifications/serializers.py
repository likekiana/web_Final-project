"""
通知应用序列化器
"""

from rest_framework import serializers
from .models import Notification
from accounts.serializers import UserProfileSerializer
from content.serializers import PostListSerializer, CommentSerializer


class NotificationSerializer(serializers.ModelSerializer):
    """通知序列化器"""
    
    # 关联字段
    recipient = UserProfileSerializer(read_only=True)
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    post = PostListSerializer(read_only=True, allow_null=True)
    comment = CommentSerializer(read_only=True, allow_null=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    read_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.BooleanField(source='status', read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'title', 'content', 'notification_type', 'status',
            'recipient', 'sender', 'post', 'comment',
            'extra_data', 'created_at', 'read_at', 'is_unread'
        )
        read_only_fields = (
            'id', 'created_at', 'read_at', 'recipient',
            'sender', 'post', 'comment', 'is_unread'
        )


class NotificationListSerializer(serializers.ModelSerializer):
    """通知列表序列化器"""
    
    # 关联字段
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    post = PostListSerializer(read_only=True, allow_null=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.BooleanField(source='status', read_only=True)
    
    class Meta:
        model = Notification
        fields = (
            'id', 'title', 'content', 'notification_type',
            'sender', 'post', 'created_at', 'is_unread'
        )
        read_only_fields = fields


class NotificationMarkReadSerializer(serializers.ModelSerializer):
    """通知标记已读序列化器"""
    
    class Meta:
        model = Notification
        fields = ('status',)
        read_only_fields = ('status',)