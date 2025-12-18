"""
积分系统模型定义
"""

from django.db import models
from django.utils.translation import gettext_lazy as _
from django.db.models import F
from accounts.models import User


class PointsInfo(models.Model):
    """用户积分信息模型"""
    
    # 关联用户
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='points_info',
        verbose_name=_('用户')
    )
    
    # 当前积分
    points = models.IntegerField(
        _('当前积分'),
        default=0,
        db_index=True,
        help_text='用户当前可用积分'
    )
    
    # 积分等级
    level = models.IntegerField(
        _('积分等级'),
        default=1,
        help_text='根据积分计算的用户等级'
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('更新时间'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('用户积分信息')
        verbose_name_plural = _('用户积分信息')
    
    def __str__(self):
        return f"{self.user.username} - {self.points}积分（等级{self.level}）"
    
    def increase_points(self, amount, reason, operator=None):
        """增加积分
        
        Args:
            amount: 增加的积分数量
            reason: 积分变动原因
            operator: 操作人（可选）
        """
        if amount <= 0:
            raise ValueError("增加的积分必须大于0")
        
        # 更新积分
        self.points = F('points') + amount
        self.save(update_fields=['points'])
        
        # 更新等级
        self.update_level()
        
        # 创建积分记录
        from .models import PointsRecord
        PointsRecord.objects.create(
            user=self.user,
            type='increase',
            amount=amount,
            reason=reason,
            operator=operator,
            balance=self.points + amount  # 因为使用了F表达式，所以需要手动计算新的余额
        )
    
    def decrease_points(self, amount, reason, operator=None):
        """减少积分
        
        Args:
            amount: 减少的积分数量
            reason: 积分变动原因
            operator: 操作人（可选）
        """
        if amount <= 0:
            raise ValueError("减少的积分必须大于0")
        
        if self.points < amount:
            raise ValueError("积分不足")
        
        # 更新积分
        self.points = F('points') - amount
        self.save(update_fields=['points'])
        
        # 更新等级
        self.update_level()
        
        # 创建积分记录
        from .models import PointsRecord
        PointsRecord.objects.create(
            user=self.user,
            type='decrease',
            amount=amount,
            reason=reason,
            operator=operator,
            balance=self.points - amount  # 因为使用了F表达式，所以需要手动计算新的余额
        )
    
    def update_level(self):
        """根据积分更新等级
        
        等级规则：
        1级：0-99积分
        2级：100-499积分
        3级：500-999积分
        4级：1000-2999积分
        5级：3000-4999积分
        6级：5000积分以上
        """
        # 刷新积分值（因为使用了F表达式）
        self.refresh_from_db()
        
        points = self.points
        if points < 100:
            new_level = 1
        elif points < 500:
            new_level = 2
        elif points < 1000:
            new_level = 3
        elif points < 3000:
            new_level = 4
        elif points < 5000:
            new_level = 5
        else:
            new_level = 6
        
        if self.level != new_level:
            self.level = new_level
            self.save(update_fields=['level'])
    
    def save(self, *args, **kwargs):
        """保存时更新等级"""
        self.update_level()
        super().save(*args, **kwargs)


class PointsRule(models.Model):
    """积分规则模型"""
    
    # 规则类型枚举
    class RuleType(models.TextChoices):
        INCREASE = 'increase', _('积分增加')
        DECREASE = 'decrease', _('积分减少')
    
    # 触发事件枚举
    class EventType(models.TextChoices):
        REGISTER = 'register', _('注册')
        LOGIN = 'login', _('登录')
        CREATE_POST = 'create_post', _('发帖')
        CREATE_COMMENT = 'create_comment', _('评论')
        LIKE_POST = 'like_post', _('点赞帖子')
        GET_LIKED = 'get_liked', _('帖子被点赞')
        GET_COMMENTED = 'get_commented', _('帖子被评论')
        REPORT = 'report', _('举报')
        REPORT_HANDLED = 'report_handled', _('举报被处理')
        OTHER = 'other', _('其他')
    
    # 规则名称
    name = models.CharField(
        _('规则名称'),
        max_length=100,
        unique=True,
        help_text='规则的唯一名称'
    )
    
    # 规则类型
    type = models.CharField(
        _('规则类型'),
        max_length=20,
        choices=RuleType.choices,
        help_text='积分增加或减少'
    )
    
    # 触发事件
    event = models.CharField(
        _('触发事件'),
        max_length=20,
        choices=EventType.choices,
        help_text='触发积分变动的事件'
    )
    
    # 积分数量
    points = models.IntegerField(
        _('积分数量'),
        help_text='每次触发事件的积分变动数量'
    )
    
    # 每日上限
    daily_limit = models.IntegerField(
        _('每日上限'),
        default=0,
        help_text='每日该规则可获取的最大积分，0表示无上限'
    )
    
    # 总上限
    total_limit = models.IntegerField(
        _('总上限'),
        default=0,
        help_text='该规则可获取的总最大积分，0表示无上限'
    )
    
    # 是否启用
    is_enabled = models.BooleanField(
        _('是否启用'),
        default=True,
        help_text='是否启用该规则'
    )
    
    # 描述
    description = models.TextField(
        _('规则描述'),
        max_length=500,
        blank=True,
        help_text='规则的详细描述'
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True
    )
    updated_at = models.DateTimeField(
        _('更新时间'),
        auto_now=True
    )
    
    class Meta:
        verbose_name = _('积分规则')
        verbose_name_plural = _('积分规则')
        ordering = ['-is_enabled', 'event']
    
    def __str__(self):
        return f"{self.get_type_display()} - {self.get_event_display()} - {self.points}积分"
    
    @classmethod
    def get_rule(cls, event):
        """根据事件获取规则
        
        Args:
            event: 触发事件
        
        Returns:
            PointsRule: 积分规则对象，若无则返回None
        """
        try:
            return cls.objects.get(event=event, is_enabled=True)
        except cls.DoesNotExist:
            return None


class PointsRecord(models.Model):
    """积分记录模型"""
    
    # 记录类型枚举
    class RecordType(models.TextChoices):
        INCREASE = 'increase', _('积分增加')
        DECREASE = 'decrease', _('积分减少')
    
    # 关联用户
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='points_records',
        verbose_name=_('用户')
    )
    
    # 记录类型
    type = models.CharField(
        _('记录类型'),
        max_length=20,
        choices=RecordType.choices,
        db_index=True
    )
    
    # 积分数量
    amount = models.IntegerField(
        _('积分数量'),
        help_text='积分变动数量'
    )
    
    # 变动后余额
    balance = models.IntegerField(
        _('变动后余额'),
        help_text='积分变动后的用户积分余额'
    )
    
    # 变动原因
    reason = models.CharField(
        _('变动原因'),
        max_length=200,
        help_text='积分变动的原因说明'
    )
    
    # 操作人（可选）
    operator = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='operated_points_records',
        verbose_name=_('操作人')
    )
    
    # 关联规则（可选）
    rule = models.ForeignKey(
        PointsRule,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='points_records',
        verbose_name=_('关联规则')
    )
    
    # 时间字段
    created_at = models.DateTimeField(
        _('创建时间'),
        auto_now_add=True,
        db_index=True
    )
    
    class Meta:
        verbose_name = _('积分记录')
        verbose_name_plural = _('积分记录')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.get_type_display()} {abs(self.amount)}积分 - {self.reason}"
