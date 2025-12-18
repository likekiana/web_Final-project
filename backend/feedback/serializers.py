"""
功能反馈序列化器
"""

from rest_framework import serializers
from .models import Feedback


class FeedbackCreateSerializer(serializers.ModelSerializer):
    """创建反馈序列化器"""
    
    class Meta:
        model = Feedback
        fields = ['type', 'title', 'content', 'contact_info']
        extra_kwargs = {
            'type': {'required': True, 'help_text': '反馈类型，可选值：suggestion, bug, other'},
            'title': {'required': True, 'help_text': '反馈标题，最多200个字符'},
            'content': {'required': True, 'help_text': '反馈内容，最多5000个字符'},
            'contact_info': {'required': False, 'help_text': '联系方式，方便我们联系您'}
        }
    
    def validate(self, data):
        """验证数据"""
        # 可以添加额外的验证逻辑
        return data


class FeedbackSerializer(serializers.ModelSerializer):
    """完整反馈序列化器"""
    
    # 额外字段
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    reporter = serializers.SerializerMethodField()
    processed_by_username = serializers.CharField(source='processed_by.username', read_only=True, default=None)
    
    class Meta:
        model = Feedback
        fields = [
            'id', 'type', 'type_display', 'title', 'content', 'contact_info', 'status',
            'status_display', 'processed_by', 'processed_by_username', 'processed_at',
            'reply', 'reporter', 'created_at', 'updated_at'
        ]
    
    def get_reporter(self, obj):
        """获取反馈人信息"""
        return {
            'id': obj.user.id,
            'username': obj.user.username,
            'avatar': obj.user.avatar
        }
    
    def validate(self, data):
        """验证数据"""
        # 可以添加额外的验证逻辑
        return data


class FeedbackProcessSerializer(serializers.ModelSerializer):
    """处理反馈序列化器"""
    
    class Meta:
        model = Feedback
        fields = ['status', 'reply']
        extra_kwargs = {
            'status': {'required': True, 'help_text': '处理状态，可选值：pending, processing, resolved, rejected'},
            'reply': {'required': True, 'help_text': '处理回复，最多2000个字符'}
        }
    
    def validate(self, data):
        """验证数据"""
        # 可以添加额外的验证逻辑
        return data
