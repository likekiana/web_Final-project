"""
AI助手应用序列化器
"""

from rest_framework import serializers
from .models import KnowledgeBase, AIResponseLog


class KnowledgeBaseListSerializer(serializers.ModelSerializer):
    """知识库列表序列化器"""
    
    class Meta:
        model = KnowledgeBase
        fields = [
            'id',
            'question',
            'answer',
            'question_type',
            'popularity',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at', 'popularity']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    """知识库详情序列化器"""
    
    class Meta:
        model = KnowledgeBase
        fields = [
            'id',
            'question',
            'answer',
            'question_type',
            'keywords',
            'weight',
            'popularity',
            'is_active',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'popularity']


class AIResponseLogSerializer(serializers.ModelSerializer):
    """AI响应日志序列化器"""
    
    class Meta:
        model = AIResponseLog
        fields = [
            'id',
            'user_input',
            'ai_response',
            'response_type',
            'knowledge_base',
            'similarity_score',
            'processing_time',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class AIQuestionSerializer(serializers.Serializer):
    """AI问答请求序列化器"""
    question = serializers.CharField(max_length=1000, required=True, help_text="用户输入的问题")


class AITitleGenerateSerializer(serializers.Serializer):
    """AI生成标题请求序列化器"""
    content = serializers.CharField(max_length=10000, required=True, help_text="帖子内容")


class AISummaryGenerateSerializer(serializers.Serializer):
    """AI生成摘要请求序列化器"""
    content = serializers.CharField(max_length=10000, required=True, help_text="帖子内容")


class AIExpandContentSerializer(serializers.Serializer):
    """AI扩展内容请求序列化器"""
    keywords = serializers.ListField(
        child=serializers.CharField(max_length=100),
        required=True,
        help_text="关键词列表"
    )
    category = serializers.CharField(max_length=100, required=True, help_text="帖子分类")


class AIEnhancedSearchSerializer(serializers.Serializer):
    """AI增强搜索请求序列化器"""
    query = serializers.CharField(max_length=1000, required=True, help_text="搜索查询")
    category = serializers.IntegerField(required=False, help_text="搜索分类ID")
