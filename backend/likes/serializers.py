"""
点赞应用序列化器
"""

from rest_framework import serializers
from .models import Like


class LikeSerializer(serializers.ModelSerializer):
    """点赞序列化器"""
    
    # 关联字段
    user = serializers.StringRelatedField()
    
    # 只读字段
    created_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Like
        fields = (
            'id', 'user', 'target_type', 'target_id', 'created_at'
        )
    
    def validate_target_type(self, value):
        """验证目标类型"""
        if value not in ['post', 'comment']:
            raise serializers.ValidationError("无效的目标类型")
        return value
    
    def validate_target_id(self, value):
        """验证目标ID"""
        if value <= 0:
            raise serializers.ValidationError("无效的目标ID")
        return value
