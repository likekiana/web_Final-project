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
    is_unread = serializers.SerializerMethodField(read_only=True)
    
    def get_is_unread(self, obj):
        """获取消息是否未读"""
        return obj.status == obj.Status.UNREAD
    
    class Meta:
        model = Message
        fields = (
            'id', 'subject', 'content', 'status', 'is_system',
            'sender', 'recipient',
            'created_at', 'read_at', 'is_unread',
            'image', 'video'
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
    is_unread = serializers.SerializerMethodField(read_only=True)
    
    def get_is_unread(self, obj):
        """获取消息是否未读"""
        return obj.status == obj.Status.UNREAD
    
    class Meta:
        model = Message
        fields = (
            'id', 'subject', 'content', 'status', 'is_system',
            'sender', 'recipient',
            'created_at', 'is_unread',
            'image', 'video'
        )
        read_only_fields = fields


class MessageCreateSerializer(serializers.ModelSerializer):
    """创建私信序列化器"""
    
    # 输入字段
    recipient_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Message
        fields = (
            'subject', 'content', 'recipient_id',
            'image', 'video'
        )
    
    def validate(self, attrs):
        """验证字段"""
        # 确保至少有内容或媒体文件之一
        content = attrs.get('content', '').strip()
        has_image = 'image' in attrs and attrs['image'] is not None
        has_video = 'video' in attrs and attrs['video'] is not None
        
        if not content and not has_image and not has_video:
            raise serializers.ValidationError("消息内容和媒体文件不能同时为空")
        
        return attrs
    
    def create(self, validated_data):
        """创建私信"""
        from accounts.models import User
        # 获取收件人ID并移除，用于后续查找用户
        recipient_id = validated_data.pop('recipient_id')
        # 查找收件人
        try:
            recipient = User.objects.get(id=recipient_id)
        except User.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError("收件人不存在")
        # 创建私信
        return Message.objects.create(
            **validated_data,
            recipient=recipient,
            sender=self.context['request'].user
        )


class MessageConversationSerializer(serializers.ModelSerializer):
    """私信对话序列化器"""
    
    # 关联字段
    sender = UserProfileSerializer(read_only=True, allow_null=True)
    recipient = UserProfileSerializer(read_only=True)
    
    # 时间字段
    created_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    read_at = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)
    
    # 额外字段
    is_unread = serializers.SerializerMethodField(read_only=True)
    
    def get_is_unread(self, obj):
        """获取消息是否未读"""
        return obj.status == obj.Status.UNREAD
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
            'created_at', 'read_at', 'is_unread',
            'image', 'video'
        )
        read_only_fields = fields