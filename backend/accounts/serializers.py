"""
用户认证应用序列化器
"""

from rest_framework import serializers
from django.contrib.auth.hashers import make_password
from .models import User


class UserSerializer(serializers.ModelSerializer):
    """用户序列化器"""
    
    # 隐藏敏感字段
    password = serializers.CharField(
        write_only=True, 
        required=True,
        style={'input_type': 'password'}
    )
    
    # 只读字段
    post_count = serializers.IntegerField(read_only=True)
    comment_count = serializers.IntegerField(read_only=True)
    reputation = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'password', 'avatar', 'bio',
            'role', 'status', 'reputation', 'post_count', 'comment_count',
            'is_active', 'is_staff', 'is_superuser',
            'created_at', 'updated_at'
        )
    
    def validate_password(self, value):
        """验证密码强度"""
        if len(value) < 6:
            raise serializers.ValidationError("密码长度不能少于6个字符")
        return value
    
    def validate_email(self, value):
        """验证邮箱格式"""
        # 确保邮箱是学校邮箱
        if not value.endswith('@xx.edu.cn'):
            raise serializers.ValidationError("请使用学校邮箱注册")
        return value
    
    def create(self, validated_data):
        """创建用户"""
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """更新用户"""
        # 如果更新密码，需要重新哈希
        if 'password' in validated_data:
            validated_data['password'] = make_password(validated_data['password'])
        return super().update(instance, validated_data)


class UserLoginSerializer(serializers.Serializer):
    """用户登录序列化器"""
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, style={'input_type': 'password'})


class UserProfileSerializer(serializers.ModelSerializer):
    """用户个人资料序列化器"""
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'avatar', 'bio',
            'role', 'reputation', 'post_count', 'comment_count',
            'created_at'
        )
        read_only_fields = ('email', 'role', 'reputation', 'post_count', 'comment_count', 'created_at')


class UserListSerializer(serializers.ModelSerializer):
    """用户列表序列化器"""
    
    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'avatar', 'role', 'status',
            'reputation', 'post_count', 'comment_count',
            'created_at'
        )
