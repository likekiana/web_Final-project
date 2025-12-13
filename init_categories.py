import sys
import os

# 添加项目根目录到Python路径
sys.path.append(os.path.abspath('backend'))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'campus_forum.settings')

import django
django.setup()

from content.models import Category

def init_categories():
    """初始化板块数据"""
    print("=== 初始化板块数据 ===")
    
    # 检查现有板块
    existing_categories = Category.objects.all()
    print(f"当前板块数量: {existing_categories.count()}")
    
    if existing_categories.count() > 0:
        print("已有板块数据，跳过初始化")
        for category in existing_categories:
            print(f"- 板块: {category.name} (ID: {category.id})")
        return
    
    # 定义初始板块数据
    initial_categories = [
        {
            "name": "校园生活",
            "description": "分享校园生活的点点滴滴，包括学习、生活、活动等",
            "icon": "HomeOutlined",
            "color": "#1890ff",
            "order": 1
        },
        {
            "name": "学习交流",
            "description": "学习资料分享、问题讨论、考试经验交流等",
            "icon": "BookOutlined",
            "color": "#52c41a",
            "order": 2
        },
        {
            "name": "二手交易",
            "description": "买卖二手物品，包括书籍、电子产品、生活用品等",
            "icon": "ShoppingCartOutlined",
            "color": "#faad14",
            "order": 3
        },
        {
            "name": "失物招领",
            "description": "发布失物信息或招领信息",
            "icon": "SearchOutlined",
            "color": "#f5222d",
            "order": 4
        },
        {
            "name": "活动预告",
            "description": "发布各类校园活动预告，包括讲座、比赛、聚会等",
            "icon": "CalendarOutlined",
            "color": "#722ed1",
            "order": 5
        }
    ]
    
    # 创建板块
    print("创建初始板块数据...")
    created_count = 0
    for cat_data in initial_categories:
        try:
            category = Category.objects.create(**cat_data)
            print(f"+ 成功创建板块: {category.name} (ID: {category.id})")
            created_count += 1
        except Exception as e:
            print(f"- 失败创建板块: {cat_data['name']}, 错误: {str(e)}")
    
    print(f"\n初始化完成，共创建 {created_count} 个板块")
    
    # 再次检查板块数量
    final_count = Category.objects.count()
    print(f"当前板块总数: {final_count}")

if __name__ == "__main__":
    init_categories()
