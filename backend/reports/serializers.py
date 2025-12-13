"""
举报应用序列化器
"""

from rest_framework import serializers
from accounts.serializers import UserProfileSerializer
from .models import Report


class ReportSerializer(serializers.ModelSerializer):
    """举报序列化器"""
    
    # 关联字段
    reporter = UserProfileSerializer(read_only=True)
    processed_by = UserProfileSerializer(read_only=True)
    
    # 只读字段
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Report
        fields = (
            'id', 'type', 'reason', 'reporter',
            'target_type', 'target_id', 'status',
            'action', 'notes', 'processed_by',
            'created_at', 'updated_at'
        )
    
    def validate_type(self, value):
        """验证举报类型"""
        if value not in ['spam', 'pornography', 'violence', 'other']:
            raise serializers.ValidationError("无效的举报类型")
        return value
    
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


class ReportCreateSerializer(serializers.ModelSerializer):
    """创建举报序列化器"""
    
    class Meta:
        model = Report
        fields = ('type', 'reason', 'target_type', 'target_id')
    
    def validate_type(self, value):
        """验证举报类型"""
        if value not in ['spam', 'pornography', 'violence', 'other']:
            raise serializers.ValidationError("无效的举报类型")
        return value
    
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


class ReportProcessSerializer(serializers.ModelSerializer):
    """处理举报序列化器"""
    
    class Meta:
        model = Report
        fields = ('status', 'action', 'notes')
    
    def validate_status(self, value):
        """验证处理状态"""
        if value != 'processed':
            raise serializers.ValidationError("处理状态必须是processed")
        return value
    
    def validate_action(self, value):
        """验证处理动作"""
        if value not in ['ignore', 'delete', 'warn']:
            raise serializers.ValidationError("无效的处理动作")