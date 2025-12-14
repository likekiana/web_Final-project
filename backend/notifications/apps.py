"""
通知应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class NotificationsConfig(AppConfig):
    """通知应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'notifications'
    verbose_name = _('通知管理')
