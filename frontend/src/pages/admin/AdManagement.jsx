import React, { useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message, Switch } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const AdManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [adStatus, setAdStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)

  // 模拟广告数据
  const mockAds = [
    { id: 1, title: '校园超市优惠活动', content: '校园超市推出新学期优惠活动，全场商品8折起，欢迎同学们前来选购！', merchant: '校园超市', status: 'active', startDate: '2023-12-01', endDate: '2023-12-31', isTop: true },
    { id: 2, title: '健身房会员特惠', content: '学校附近健身房推出学生特惠，办理年卡享受6折优惠，还有免费体验课！', merchant: '健身俱乐部', status: 'active', startDate: '2023-12-05', endDate: '2024-01-15', isTop: false },
    { id: 3, title: '考研辅导班招生', content: '知名考研辅导机构在我校招生，提供专业的考研辅导课程，现在报名享受早鸟优惠！', merchant: '考研辅导中心', status: 'pending', startDate: '2023-12-10', endDate: '2024-03-31', isTop: false },
    { id: 4, title: '二手书店开业', content: '学校门口新开二手书店，收购和出售各类二手书籍，价格优惠！', merchant: '二手书店', status: 'active', startDate: '2023-12-15', endDate: '2024-02-28', isTop: false }
  ]

  // 筛选广告
  const filteredAds = mockAds.filter(ad => {
    const matchesSearch = ad.title.toLowerCase().includes(searchText.toLowerCase()) || 
                         ad.content.toLowerCase().includes(searchText.toLowerCase()) ||
                         ad.merchant.toLowerCase().includes(searchText.toLowerCase())
    const matchesStatus = !adStatus || ad.status === adStatus
    return matchesSearch && matchesStatus
  })

  // 广告状态标签配置
  const getAdStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>
      case 'pending':
        return <Tag color="orange">待审核</Tag>
      case 'expired':
        return <Tag color="gray">已过期</Tag>
      case 'rejected':
        return <Tag color="red">已拒绝</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 广告表格列配置
  const columns = [
    {
      title: '广告ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          {record.isTop && <Tag color="red">置顶</Tag>}
          {text}
        </Space>
      )
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: {
        rows: 2,
        expandable: true
      }
    },
    {
      title: '商户',
      dataIndex: 'merchant',
      key: 'merchant',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getAdStatusTag(text)
    },
    {
      title: '开始日期',
      dataIndex: 'startDate',
      key: 'startDate'
    },
    {
      title: '结束日期',
      dataIndex: 'endDate',
      key: 'endDate'
    },
    {
      title: '置顶',
      dataIndex: 'isTop',
      key: 'isTop',
      render: (text) => <Switch checked={text} onChange={(checked) => handleToggleTop(checked)} />,
      width: 80
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
          {record.status === 'pending' && (
            <Space>
              <Button icon={<CheckCircleOutlined />} size="small" onClick={() => handleApprove(record.id)}>
                批准
              </Button>
              <Button icon={<CloseCircleOutlined />} size="small" onClick={() => handleReject(record.id)}>
                拒绝
              </Button>
            </Space>
          )}
        </Space>
      )
    }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleToggleTop = (checked) => {
    message.success(`广告${checked ? '置顶' : '取消置顶'}成功`)
    // 这里可以添加切换置顶状态的逻辑
  }

  const handleApprove = (adId) => {
    message.success('广告批准成功')
    // 这里可以添加批准广告的逻辑
  }

  const handleReject = (adId) => {
    message.success('广告拒绝成功')
    // 这里可以添加拒绝广告的逻辑
  }

  const handleDelete = (adId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个广告吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('广告删除成功')
        // 这里可以添加删除广告的逻辑
      }
    })
  }

  return (
    <div>
      <Title level={2}>广告管理</Title>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索广告标题、内容或商户"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="选择广告状态"
            allowClear
            size="middle"
            onChange={setAdStatus}
            style={{ width: 150 }}
          >
            <Option value="active">活跃</Option>
            <Option value="pending">待审核</Option>
            <Option value="expired">已过期</Option>
            <Option value="rejected">已拒绝</Option>
          </Select>
        </Space>
      </Card>

      {/* 广告列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredAds}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default AdManagement