import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message, Switch } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const AdManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [adStatus, setAdStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [ads, setAds] = useState([])

  // 从API获取广告数据
  useEffect(() => {
    fetchAds()
  }, [searchText, adStatus])

  const fetchAds = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getAds({
        search: searchText,
        status: adStatus
      })
      if (response.success) {
        setAds(response.data.advertisements || [])
      } else {
        message.error(response.message || '获取广告列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch ads:', error)
      message.error('获取广告列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 广告数据已经通过API筛选，这里不再需要本地筛选
  const filteredAds = ads

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
            <Select.Option value="active">活跃</Select.Option>
            <Select.Option value="pending">待审核</Select.Option>
            <Select.Option value="expired">已过期</Select.Option>
            <Select.Option value="rejected">已拒绝</Select.Option>
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