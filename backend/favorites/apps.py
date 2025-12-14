"""
收藏应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class FavoritesConfig(AppConfig):
    """收藏应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'favorites'
    verbose_name = _('收藏管理')
