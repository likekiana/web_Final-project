import React, { useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Form, Modal, message } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Search } = Input

const CategoryManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [form] = Form.useForm()

  // 模拟板块数据
  const mockCategories = [
    { id: 1, name: '学习学术区', description: '学习资料共享、考研/保研信息、学习经验交流、学术问题讨论', icon: 'book', color: '#1890ff', postCount: 100, order: 1 },
    { id: 2, name: '校园生活区', description: '生活攻略、失物招领、校内资讯、生活问答', icon: 'home', color: '#52c41a', postCount: 200, order: 2 },
    { id: 3, name: '二手交易区', description: '教材书籍交易、数码产品交易、生活用品交易、交易信誉评价', icon: 'shopping-cart', color: '#faad14', postCount: 150, order: 3 },
    { id: 4, name: '活动社交区', description: '社团活动发布、比赛/竞赛信息、运动/娱乐组队、社交互动', icon: 'team', color: '#722ed1', postCount: 120, order: 4 },
    { id: 5, name: '实习就业区', description: '实习信息发布、求职经验分享、企业宣讲会信息、简历/面试指导', icon: 'briefcase', color: '#eb2f96', postCount: 90, order: 5 },
    { id: 6, name: '真情流露区', description: '树洞倾诉、表白墙功能、匿名交流、情感支持', icon: 'heart', color: '#f5222d', postCount: 80, order: 6 },
    { id: 7, name: '广告专区', description: '商户信息发布、优惠活动宣传、校园服务推广、官方通知公告', icon: 'announcement', color: '#fa8c16', postCount: 50, order: 7 }
  ]

  // 筛选板块
  const filteredCategories = mockCategories.filter(category => 
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
      dataIndex: 'postCount',
      key: 'postCount',
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
      onOk: () => {
        message.success('板块删除成功')
        // 这里可以添加删除板块的逻辑
      }
    })
  }

  const handleModalOk = () => {
    form.validateFields().then(values => {
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
        setIsModalVisible(false)
        message.success(isEditMode ? '板块更新成功' : '板块创建成功')
        // 这里可以添加保存板块的逻辑
      }, 1000)
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
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 添加/编辑板块模态框 */}
      <Modal
        title={isEditMode ? '编辑板块' : '添加板块'}
        visible={isModalVisible}
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
            icon: 'book',
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
            name="order"
            rules={[{ required: true, message: '请输入排序值!' }]}
            label="排序值"
          >
            <Input.Number placeholder="请输入排序值" min={1} max={100} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

export default CategoryManagement