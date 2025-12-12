"""
广告应用序列化器
"""

from rest_framework import serializers
from .models import Advertisement


class AdvertisementSerializer(serializers.ModelSerializer):
    """广告序列化器"""
    
    # 关联字段
    merchant = serializers.StringRelatedField()
    
    # 只读字段
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Advertisement
        fields = (
            'id', 'title', 'content', 'images', 'url',
            'merchant', 'start_date', 'end_date', 'status',
            'views_count', 'clicks_count',
            'created_at', 'updated_at'
        )
    
    def validate_title(self, value):
        """验证广告标题"""
        if len(value) < 5:
            raise serializers.ValidationError("广告标题长度不能少于5个字符")
        return value
    
    def validate_content(self, value):
        """验证广告内容"""
        if len(value) < 10:
            raise serializers.ValidationError("广告内容长度不能少于10个字符")
        return value


class AdvertisementCreateSerializer(serializers.ModelSerializer):
    """创建广告序列化器"""
    
    class Meta:
        model = Advertisement
        fields = (
            'title', 'content', 'images', 'url',
            'start_date', 'end_date'
        )
    
    def validate_title(self, value):
        """验证广告标题"""
        if len(value) < 5:
            raise serializers.ValidationError("广告标题长度不能少于5个字符")
        return value
    
    def validate_content(self, value):
        """验证广告内容"""
        if len(value) < 10:
            raise serializers.ValidationError("广告内容长度不能少于10个字符")
        return value


class AdvertisementUpdateSerializer(serializers.ModelSerializer):
    """更新广告序列化器"""
    
    class Meta:
        model = Advertisement
        fields = (
            'title', 'content', 'images', 'url',
            'start_date', 'end_date', 'status'
        )
    
    def validate_title(self, value):
        """验证广告标题"""
        if len(value) < 5:
            raise serializers.ValidationError("广告标题长度不能少于5个字符")
        return value
    
    def validate_content(self, value):
        """验证广告内容"""
        if len(value) < 10:
            raise serializers.ValidationError("广告内容长度不能少于10个字符")
       