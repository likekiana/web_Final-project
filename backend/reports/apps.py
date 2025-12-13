"""
举报应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ReportsConfig(AppConfig):
    """举报应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'reports'
    verbose_name = _('举报')