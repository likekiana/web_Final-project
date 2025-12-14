import os

# List of files to rename
files = [
    ('产品需求文档v1.0.md', '产品需求文档v1.4.md'),
    ('数据库设计文档v1.0.md', '数据库设计文档v1.4.md'),
    ('项目设计文档v1.0.md', '项目设计文档v1.4.md'),
    ('API设计文档v1.0.md', 'API设计文档v1.4.md')
]

# Rename each file
for old_name, new_name in files:
    if os.path.exists(old_name):
        os.rename(old_name, new_name)
        print(f"Renamed: {old_name} -> {new_name}")
    else:
        print(f"File not found: {old_name}")

print("\nAll files renamed successfully!")
