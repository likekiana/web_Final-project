"""
内容管理应用序列化器
"""

from rest_framework import serializers
from accounts.models import User
from accounts.serializers import UserProfileSerializer
from .models import Category, Post, Comment


class CategorySerializer(serializers.ModelSerializer):
    """板块序列化器"""
    
    # 只读字段
    post_count = serializers.IntegerField(read_only=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Category
        fields = (
            'id', 'name', 'description', 'icon', 'color',
            'post_count', 'order', 'created_at', 'updated_at'
        )
    
    def validate_name(self, value):
        """验证板块名称"""
        if len(value) < 2:
            raise serializers.ValidationError("板块名称长度不能少于2个字符")
        return value
    
    def validate_description(self, value):
        """验证板块描述"""
        if len(value) < 10:
            raise serializers.ValidationError("板块描述长度不能少于10个字符")
        return value


class PostSerializer(serializers.ModelSerializer):
    """帖子序列化器"""
    
    # 关联字段
    user = UserProfileSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    
    # 输入字段（用于创建和更新）
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=User.objects.all(), 
        source='user',
        required=False
    )
    category_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=Category.objects.all(), 
        source='category',
        required=True
    )
    
    # 统计和状态字段
    likes_count = serializers.IntegerField(read_only=True)
    comments_count = serializers.IntegerField(read_only=True)
    views_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True, default=False)
    
    # 时间字段
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Post
        fields = (
            'id', 'title', 'content', 'images', 'type', 'status',
            'user', 'user_id', 'category', 'category_id',
            'likes_count', 'comments_count', 'views_count',
            'is_liked', 'is_sticky', 'is_essential',
            'created_at', 'updated_at'
        )
    
    def validate_title(self, value):
        """验证帖子标题"""
        if len(value) < 5:
            raise serializers.ValidationError("帖子标题长度不能少于5个字符")
        return value
    
    def validate_content(self, value):
        """验证帖子内容"""
        if len(value) < 10:
            raise serializers.ValidationError("帖子内容长度不能少于10个字符")
        return value
    
    def create(self, validated_data):
        """创建帖子"""
        # 如果没有提供user_id，使用当前登录用户
        if 'user' not in validated_data:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CommentSerializer(serializers.ModelSerializer):
    """评论序列化器"""
    
    # 关联字段
    user = UserProfileSerializer(read_only=True)
    
    # 输入字段
    user_id = serializers.PrimaryKeyRelatedField(
        write_only=True, 
        queryset=User.objects.all(), 
        source='user',
        required=False
    )
    
    # 统计字段
    likes_count = serializers.IntegerField(read_only=True)
    is_liked = serializers.BooleanField(read_only=True, default=False)
    
    # 时间字段
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    
    class Meta:
        model = Comment
        fields = (
            'id', 'content', 'user', 'user_id', 'post',
            'likes_count', 'is_liked', 'status',
            'created_at', 'updated_at'
        )
    
    def validate_content(self, value):
        """验证评论内容"""
        if len(value) < 1:
            raise serializers.ValidationError("评论内容不能为空")
        return value
    
    def create(self, validated_data):
        """创建评论"""
        # 如果没有提供user_id，使用当前登录用户
        if 'user' not in validated_data:
            validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class CategoryListSerializer(CategorySerializer):
    """板块列表序列化器"""
    
    class Meta(CategorySerializer.Meta):
        fields = (
            'id', 'name', 'description', 'icon', 'color',
            'post_count', 'order'
        )


class PostListSerializer(PostSerializer):
    """帖子列表序列化器"""
    
    class Meta(PostSerializer.Meta):
        fields = (
            'id', 'title', 'type', 'user', 'category',
            'likes_count', 'comments_count', 'views_count',
            'is_liked', 'is_sticky', 'is_essential',
            'created_at'
        )


class CommentListSerializer(CommentSerializer):
    """评论列表序列化器"""
    
    class Meta(CommentSerializer.Meta):
        fields = (
            'id', 'content', 'user', 'likes_count',
            'is_liked', 'created_at'
        )
