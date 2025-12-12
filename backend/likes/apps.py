"""
点赞应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class LikesConfig(AppConfig):
    """点赞应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'likes'
    verbose_name = _('点赞管理')
