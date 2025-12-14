"""
关注应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class FollowsConfig(AppConfig):
    """关注应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'follows'
    verbose_name = _('关注管理')
