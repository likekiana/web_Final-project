import os

# 定义要重命名的文件映射
files_to_rename = {
    '产品需求文档v1.0.md': '产品需求文档v1.4.md',
    '数据库设计文档v1.0.md': '数据库设计文档v1.4.md',
    '项目设计文档v1.0.md': '项目设计文档v1.4.md',
    'API设计文档v1.0.md': 'API设计文档v1.4.md'
}

# 当前目录
current_dir = 'G:/web_Final-project'

# 遍历文件映射，执行重命名
for old_name, new_name in files_to_rename.items():
    old_path = os.path.join(current_dir, old_name)
    new_path = os.path.join(current_dir, new_name)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f'Renamed: {old_name} -> {new_name}')
    else:
        print(f'File not found: {old_name}')
