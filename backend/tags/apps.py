"""
标签应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class TagsConfig(AppConfig):
    """标签应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'tags'
    verbose_name = _('标签管理')
