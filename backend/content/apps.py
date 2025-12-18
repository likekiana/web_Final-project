"""
内容管理应用配置
"""

from django.apps import AppConfig
from django.utils.translation import gettext_lazy as _


class ContentConfig(AppConfig):
    """内容管理应用配置"""
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'content'
    verbose_name = _('内容管理')
    
    def ready(self):
        """应用初始化时导入信号模块"""
        import content.signals  # noqa
