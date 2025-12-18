"""
积分系统序列化器
"""

from rest_framework import serializers
from .models import PointsInfo, PointsRule, PointsRecord
from accounts.serializers import UserSerializer
from .services import points_service


class PointsInfoSerializer(serializers.ModelSerializer):
    """用户积分信息序列化器"""
    
    # 额外字段
    user_username = serializers.CharField(source='user.username', read_only=True)
    level_name = serializers.SerializerMethodField()
    next_level = serializers.SerializerMethodField()
    points_needed = serializers.SerializerMethodField()
    progress = serializers.SerializerMethodField()
    
    class Meta:
        model = PointsInfo
        fields = [
            'id', 'user', 'user_username', 'points', 'level', 'level_name',
            'next_level', 'points_needed', 'progress', 'created_at', 'updated_at'
        ]
    
    def get_level_name(self, obj):
        """获取等级名称"""
        return points_service.get_level_name(obj.level)
    
    def get_next_level(self, obj):
        """获取下一级等级"""
        next_level_info = points_service.calculate_next_level_points(obj.level, obj.points)
        return next_level_info['next_level']
    
    def get_points_needed(self, obj):
        """获取升级还需要的积分"""
        next_level_info = points_service.calculate_next_level_points(obj.level, obj.points)
        return next_level_info['points_needed']
    
    def get_progress(self, obj):
        """获取升级进度百分比"""
        next_level_info = points_service.calculate_next_level_points(obj.level, obj.points)
        return next_level_info['progress']


class PointsRecordSerializer(serializers.ModelSerializer):
    """积分记录序列化器"""
    
    # 额外字段
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    operator_username = serializers.CharField(source='operator.username', read_only=True, default=None)
    rule_name = serializers.CharField(source='rule.name', read_only=True, default=None)
    
    class Meta:
        model = PointsRecord
        fields = [
            'id', 'user', 'user_username', 'type', 'type_display', 'amount',
            'balance', 'reason', 'operator', 'operator_username', 'rule',
            'rule_name', 'created_at'
        ]
    
    def validate(self, data):
        """验证数据"""
        # 可以添加额外的验证逻辑
        return data


class PointsRuleSerializer(serializers.ModelSerializer):
    """积分规则序列化器"""
    
    # 额外字段
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    event_display = serializers.CharField(source='get_event_display', read_only=True)
    
    class Meta:
        model = PointsRule
        fields = [
            'id', 'name', 'type', 'type_display', 'event', 'event_display',
            'points', 'daily_limit', 'total_limit', 'is_enabled',
            'description', 'created_at', 'updated_at'
        ]
    
    def validate(self, data):
        """验证数据"""
        # 确保积分数量不为0
        if data.get('points') == 0:
            raise serializers.ValidationError("积分数量不能为0")
        
        return data


class PointsAwardSerializer(serializers.Serializer):
    """积分奖励序列化器"""
    
    event = serializers.ChoiceField(
        choices=PointsRule.EventType.choices,
        help_text='触发事件类型'
    )
    amount = serializers.IntegerField(
        required=False,
        min_value=1,
        help_text='自定义积分数量（可选）'
    )
    reason = serializers.CharField(
        required=False,
        max_length=200,
        help_text='自定义积分变动原因（可选）'
    )


class PointsDeductSerializer(serializers.Serializer):
    """积分扣除序列化器"""
    
    amount = serializers.IntegerField(
        required=True,
        min_value=1,
        help_text='扣除的积分数量'
    )
    reason = serializers.CharField(
        required=True,
        max_length=200,
        help_text='积分变动原因'
    )


class PointsBatchUpdateSerializer(serializers.Serializer):
    """批量更新积分序列化器"""
    
    user_ids = serializers.ListField(
        child=serializers.IntegerField(),
        help_text='用户ID列表'
    )
    points_change = serializers.IntegerField(
        help_text='积分变动数量（正数增加，负数减少）'
    )
    reason = serializers.CharField(
        required=True,
        max_length=200,
        help_text='积分变动原因'
    )
    
    def validate(self, data):
        """验证数据"""
        # 确保积分变动数量不为0
        if data.get('points_change') == 0:
            raise serializers.ValidationError("积分变动数量不能为0")
        
        # 确保用户ID列表不为空
        if not data.get('user_ids'):
            raise serializers.ValidationError("用户ID列表不能为空")
        
        return data


class PointsRankSerializer(serializers.ModelSerializer):
    """积分排名序列化器"""
    
    username = serializers.CharField(source='user.username')
    level_name = serializers.SerializerMethodField()
    avatar = serializers.CharField(source='user.avatar')
    
    class Meta:
        model = PointsInfo
        fields = [
            'id', 'username', 'avatar', 'points', 'level', 'level_name'
        ]
    
    def get_level_name(self, obj):
        """获取等级名称"""
        return points_service.get_level_name(obj.level)
