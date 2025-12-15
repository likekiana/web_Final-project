"""
私信应用序列化器
"""

from rest_framework import serializers
from .models import Message
from accounts.serializers import UserProfileSerializer


class MessageSerializer(serializers.ModelSerializer):
    """私信序列化器"""
    
    # 关联字段
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    recipient = UserProfileSerializer(read_only=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    read_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.BooleanField(source='status', read_only=True)
    
    class Meta:
        model = Message
        fields = (
            'id', 'subject', 'content', 'status', 'is_system',
            'sender', 'recipient',
            'created_at', 'read_at', 'is_unread'
        )
        read_only_fields = (
            'id', 'created_at', 'read_at', 'sender',
            'recipient', 'is_system', 'is_unread'
        )


class MessageListSerializer(serializers.ModelSerializer):
    """私信列表序列化器"""
    
    # 关联字段
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    recipient = UserProfileSerializer(read_only=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.BooleanField(source='status', read_only=True)
    
    class Meta:
        model = Message
        fields = (
            'id', 'subject', 'content', 'status', 'is_system',
            'sender', 'recipient',
            'created_at', 'is_unread'
        )
        read_only_fields = fields


class MessageCreateSerializer(serializers.ModelSerializer):
    """创建私信序列化器"""
    
    # 输入字段
    recipient_id = serializers.IntegerField(write_only=True, source='recipient')
    
    class Meta:
        model = Message
        fields = (
            'subject', 'content', 'recipient_id'
        )
    
    def validate(self, attrs):
        """验证字段"""
        # 确保内容不为空
        if not attrs.get('content').strip():
            raise serializers.ValidationError("消息内容不能为空")
        return attrs


class MessageConversationSerializer(serializers.ModelSerializer):
    """私信对话序列化器"""
    
    # 关联字段
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    recipient = UserProfileSerializer(read_only=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    read_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.BooleanField(source='status', read_only=True)
    conversation_partner = serializers.SerializerMethodField()
    
    def get_conversation_partner(self, obj):
        """获取对话的另一方用户"""
        user = self.context.get('user')
        if not user:
            return None
        partner = obj.get_conversation_partner(user)
        return UserProfileSerializer(partner).data if partner else None
    
    class Meta:
        model = Message
        fields = (
            'id', 'subject', 'content', 'status', 'is_system',
            'sender', 'recipient', 'conversation_partner',
            'created_at', 'read_at', 'is_unread'
        )
        read_only_fields = fields