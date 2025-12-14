"""
私信应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class UserMessagesConfig(AppConfig):
    """私信应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'user_messages'
    verbose_name = _('私信管理')
