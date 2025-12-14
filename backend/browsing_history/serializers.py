from rest_framework import serializers
from .models import BrowsingHistory
from content.serializers import PostSerializer
from accounts.serializers import UserSerializer


class BrowsingHistorySerializer(serializers.ModelSerializer):
    """浏览历史序列化器"""
    # 嵌套序列化帖子和用户信息
    post = PostSerializer(read_only=True)
    user = UserSerializer(read_only=True)

    class Meta:
        model = BrowsingHistory
        fields = ['id', 'user', 'post', 'viewed_at']
        read_only_fields = ['id', 'user', 'post', 'viewed_at']
