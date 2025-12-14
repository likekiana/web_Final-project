"""
用户认证应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class AccountsConfig(AppConfig):
    """用户认证应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'
    verbose_name = _('用户认证')
    
    def ready(self):
        """应用初始化时导入信号模块"""
        import accounts.signals  # noqa
