import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, InputNumber, Form, Modal, message, Select } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'
import { categoryAPI } from '../../services/api'

const { Title } = Typography
const { Search } = Input

const CategoryManagement = () => {
  const [loading, setLoading] = useState(false)
  const [categoriesLoading, setCategoriesLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])

  // 获取板块列表
  const fetchCategories = async () => {
    setCategoriesLoading(true)
    try {
      const response = await categoryAPI.getCategories()
      if (response.success) {
        setCategories(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
      message.error('获取板块列表失败')
      setCategories([])
    } finally {
      setCategoriesLoading(false)
    }
  }

  // 初始化获取板块数据
  useEffect(() => {
    fetchCategories()
  }, [])

  // 筛选板块
  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchText.toLowerCase()) ||
    category.description.toLowerCase().includes(searchText.toLowerCase())
  )

  // 板块表格列配置
  const columns = [
    {
      title: '板块ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <div style={{ 
            width: 16, 
            height: 16, 
            backgroundColor: record.color, 
            borderRadius: 4,
            display: 'inline-block',
            marginRight: 8
          }} />
          {text}
        </Space>
      )
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: {
        rows: 2,
        expandable: true
      }
    },
    {
      title: '帖子数量',
      dataIndex: 'post_count',
      key: 'post_count',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '排序',
      dataIndex: 'order',
      key: 'order'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleAdd = () => {
    setIsEditMode(false)
    setSelectedCategory(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (category) => {
    setIsEditMode(true)
    setSelectedCategory(category)
    form.setFieldsValue(category)
    setIsModalVisible(true)
  }

  const handleDelete = (categoryId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个板块吗？删除后该板块下的所有帖子将被转移到其他板块。',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        try {
          const response = await categoryAPI.deleteCategory(categoryId)
          if (response.success) {
            message.success('板块删除成功')
            // 重新获取板块列表
            fetchCategories()
          }
        } catch (error) {
          console.error('Failed to delete category:', error)
          message.error('板块删除失败')
        }
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(async values => {
      setLoading(true)
      try {
        let response
        if (isEditMode) {
          response = await categoryAPI.updateCategory(selectedCategory.id, values)
        } else {
          response = await categoryAPI.createCategory(values)
        }
        
        if (response.success) {
          setIsModalVisible(false)
          message.success(isEditMode ? '板块更新成功' : '板块创建成功')
          // 重新获取板块列表
          fetchCategories()
        }
      } catch (error) {
        console.error('Failed to save category:', error)
        message.error(isEditMode ? '板块更新失败' : '板块创建失败')
      } finally {
        setLoading(false)
      }
    }).catch(info => {
      console.log('Validation failed:', info)
    })
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    form.resetFields()
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>板块管理</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          添加板块
        </Button>
      </div>
      
      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索板块名称或描述"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      {/* 板块列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredCategories}
          rowKey="id"
          loading={categoriesLoading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 添加/编辑板块模态框 */}
      <Modal
        title={isEditMode ? '编辑板块' : '添加板块'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            name: '',
            description: '',
            icon: 'BookOutlined',
            color: '#1890ff',
            order: 1
          }}
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: '请输入板块名称!' },
              { min: 2, message: '板块名称长度不能少于2个字符!' },
              { max: 20, message: '板块名称长度不能超过20个字符!' }
            ]}
            label="板块名称"
          >
            <Input placeholder="请输入板块名称" />
          </Form.Item>

          <Form.Item
            name="description"
            rules={[
              { required: true, message: '请输入板块描述!' },
              { min: 10, message: '板块描述长度不能少于10个字符!' },
              { max: 200, message: '板块描述长度不能超过200个字符!' }
            ]}
            label="板块描述"
          >
            <Input.TextArea rows={4} placeholder="请输入板块描述" />
          </Form.Item>

          <Form.Item
            name="icon"
            rules={[{ required: true, message: '请选择板块图标!' }]}
            label="板块图标"
          >
            <Select placeholder="请选择板块图标">
              <Select.Option value="BookOutlined">图书</Select.Option>
              <Select.Option value="HomeOutlined">首页</Select.Option>
              <Select.Option value="ShoppingCartOutlined">购物车</Select.Option>
              <Select.Option value="TeamOutlined">团队</Select.Option>
              <Select.Option value="FileTextOutlined">文档</Select.Option>
              <Select.Option value="HeartOutlined">收藏</Select.Option>
              <Select.Option value="BellOutlined">通知</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="color"
            rules={[{ required: true, message: '请选择板块颜色!' }]}
            label="板块颜色"
          >
            <Input placeholder="请输入颜色代码，如 #1890ff" />
          </Form.Item>

          <Form.Item
            name="order"
            rules={[{ required: true, message: '请输入排序值!' }]}
            label="排序值"
          >
            <InputNumber placeholder="请输入排序值" min={1} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryManagement