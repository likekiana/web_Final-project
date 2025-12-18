"""
积分系统服务层
"""

from django.utils import timezone
from django.db import transaction, models
from .models import PointsInfo, PointsRule, PointsRecord
from accounts.models import User


class PointsService:
    """积分服务类"""
    
    @staticmethod
    def get_or_create_points_info(user):
        """获取或创建用户积分信息
        
        Args:
            user: 用户对象
            
        Returns:
            PointsInfo: 用户积分信息对象
        """
        points_info, created = PointsInfo.objects.get_or_create(user=user)
        return points_info
    
    @staticmethod
    def award_points(user, event, amount=None, reason=None, operator=None):
        """根据事件奖励积分
        
        Args:
            user: 用户对象
            event: 触发事件
            amount: 自定义积分数量（可选）
            reason: 自定义原因（可选）
            operator: 操作人（可选）
            
        Returns:
            dict: 积分变动结果
        """
        # 获取积分规则
        rule = PointsRule.get_rule(event)
        if not rule:
            return {
                'success': False,
                'message': f'未找到事件{event}的积分规则'
            }
        
        # 使用规则定义的积分数量，除非提供了自定义数量
        points_amount = amount or rule.points
        if points_amount <= 0:
            return {
                'success': False,
                'message': '积分数量必须大于0'
            }
        
        # 获取或创建用户积分信息
        points_info = PointsService.get_or_create_points_info(user)
        
        # 检查每日上限
        if rule.daily_limit > 0:
            today = timezone.now().date()
            daily_total = PointsRecord.objects.filter(
                user=user,
                type='increase',
                rule=rule,
                created_at__date=today
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            if daily_total + points_amount > rule.daily_limit:
                return {
                    'success': False,
                    'message': f'今日该事件积分已达上限（每日上限{rule.daily_limit}积分）'
                }
        
        # 检查总上限
        if rule.total_limit > 0:
            total_total = PointsRecord.objects.filter(
                user=user,
                type='increase',
                rule=rule
            ).aggregate(total=models.Sum('amount'))['total'] or 0
            if total_total + points_amount > rule.total_limit:
                return {
                    'success': False,
                    'message': f'该事件积分已达总上限（总上限{rule.total_limit}积分）'
                }
        
        # 使用事务确保数据一致性
        with transaction.atomic():
            # 增加积分
            points_info.increase_points(
                points_amount,
                reason or rule.description or f'参与{event}事件',
                operator
            )
            
            # 更新积分记录的规则关联
            # 注意：这里需要重新获取最新的积分记录，因为之前的创建是在increase_points方法中完成的
            latest_record = PointsRecord.objects.filter(
                user=user,
                type='increase',
                created_at__gte=timezone.now() - timezone.timedelta(minutes=1)
            ).order_by('-created_at').first()
            if latest_record:
                latest_record.rule = rule
                latest_record.save(update_fields=['rule'])
        
        return {
            'success': True,
            'message': f'积分奖励成功，获得{points_amount}积分',
            'points_amount': points_amount,
            'points_info': points_info
        }
    
    @staticmethod
    def deduct_points(user, amount, reason, operator=None):
        """扣除积分
        
        Args:
            user: 用户对象
            amount: 扣除的积分数量
            reason: 扣除原因
            operator: 操作人（可选）
            
        Returns:
            dict: 积分变动结果
        """
        if amount <= 0:
            return {
                'success': False,
                'message': '扣除的积分必须大于0'
            }
        
        # 获取或创建用户积分信息
        points_info = PointsService.get_or_create_points_info(user)
        
        # 检查积分是否足够
        if points_info.points < amount:
            return {
                'success': False,
                'message': f'积分不足，当前积分{points_info.points}，需要{amount}积分'
            }
        
        # 使用事务确保数据一致性
        with transaction.atomic():
            # 扣除积分
            points_info.decrease_points(amount, reason, operator)
        
        return {
            'success': True,
            'message': f'积分扣除成功，扣除{amount}积分',
            'points_amount': amount,
            'points_info': points_info
        }
    
    @staticmethod
    def get_user_points_info(user):
        """获取用户积分信息
        
        Args:
            user: 用户对象
            
        Returns:
            PointsInfo: 用户积分信息对象
        """
        return PointsService.get_or_create_points_info(user)
    
    @staticmethod
    def get_user_points_records(user, limit=20, offset=0):
        """获取用户积分记录
        
        Args:
            user: 用户对象
            limit: 每页记录数
            offset: 偏移量
            
        Returns:
            tuple: (积分记录列表, 总记录数)
        """
        records = PointsRecord.objects.filter(user=user).order_by('-created_at')
        total = records.count()
        paginated_records = records[offset:offset + limit]
        return paginated_records, total
    
    @staticmethod
    def get_level_name(level):
        """根据等级获取等级名称
        
        Args:
            level: 等级数值
            
        Returns:
            str: 等级名称
        """
        level_names = {
            1: '新生',
            2: '活跃用户',
            3: '核心用户',
            4: '资深用户',
            5: '专家用户',
            6: '大师用户'
        }
        return level_names.get(level, f'等级{level}')
    
    @staticmethod
    def calculate_next_level_points(current_level, current_points):
        """计算升级还需要的积分
        
        Args:
            current_level: 当前等级
            current_points: 当前积分
            
        Returns:
            dict: 包含下一级所需积分和当前进度
        """
        # 等级积分区间
        level_points = {
            1: (0, 99),
            2: (100, 499),
            3: (500, 999),
            4: (1000, 2999),
            5: (3000, 4999),
            6: (5000, float('inf'))
        }
        
        if current_level >= 6:
            return {
                'next_level': None,
                'next_level_points': 0,
                'points_needed': 0,
                'progress': 100
            }
        
        # 计算下一级所需积分
        next_level = current_level + 1
        next_level_min = level_points[next_level][0]
        next_level_max = level_points[next_level][1]
        points_needed = next_level_min - current_points
        
        # 计算当前等级的积分范围
        current_level_min = level_points[current_level][0]
        current_level_max = level_points[current_level][1]
        current_level_range = current_level_max - current_level_min
        
        # 计算进度百分比
        if current_level_range > 0:
            progress = ((current_points - current_level_min) / current_level_range) * 100
        else:
            progress = 100
        
        return {
            'next_level': next_level,
            'next_level_points': next_level_min,
            'points_needed': max(0, points_needed),
            'progress': min(100, round(progress))
        }
    
    @staticmethod
    def batch_update_points(user_ids, points_change, reason, operator=None):
        """批量更新用户积分
        
        Args:
            user_ids: 用户ID列表
            points_change: 积分变动数量（正数增加，负数减少）
            reason: 变动原因
            operator: 操作人（可选）
            
        Returns:
            dict: 批量更新结果
        """
        success_count = 0
        failed_count = 0
        failed_users = []
        
        for user_id in user_ids:
            try:
                user = User.objects.get(id=user_id)
                if points_change > 0:
                    result = PointsService.award_points(
                        user,
                        'other',
                        points_change,
                        reason,
                        operator
                    )
                else:
                    result = PointsService.deduct_points(
                        user,
                        abs(points_change),
                        reason,
                        operator
                    )
                if result['success']:
                    success_count += 1
                else:
                    failed_count += 1
                    failed_users.append({
                        'user_id': user_id,
                        'message': result['message']
                    })
            except User.DoesNotExist:
                failed_count += 1
                failed_users.append({
                    'user_id': user_id,
                    'message': '用户不存在'
                })
            except Exception as e:
                failed_count += 1
                failed_users.append({
                    'user_id': user_id,
                    'message': str(e)
                })
        
        return {
            'success': True,
            'message': f'批量更新完成，成功{success_count}人，失败{failed_count}人',
            'success_count': success_count,
            'failed_count': failed_count,
            'failed_users': failed_users
        }


# 创建全局服务实例
points_service = PointsService()
