"""
广告应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AdsConfig(AppConfig):
    """广告应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'ads'
    verbose_name = _('广告管理')
