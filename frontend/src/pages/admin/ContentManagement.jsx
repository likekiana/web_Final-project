import React, { useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message, Tabs } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Search } = Input
const { Option } = Select
const { TabPane } = Tabs

const ContentManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [contentType, setContentType] = useState('posts') // 'posts' or 'comments'
  const [selectedTab, setSelectedTab] = useState('posts')

  // 模拟帖子数据
  const mockPosts = [
    { id: 1, title: '如何高效准备期末考试？', categoryName: '学习学术区', username: 'testuser', status: 'active', likesCount: 15, commentsCount: 8, createdAt: '2023-12-10T15:30:00Z' },
    { id: 2, title: '出售二手笔记本电脑', categoryName: '二手交易区', username: 'user2', status: 'active', likesCount: 5, commentsCount: 3, createdAt: '2023-12-09T10:20:00Z' },
    { id: 3, title: '社团招新啦！', categoryName: '活动社交区', username: 'user3', status: 'active', likesCount: 20, commentsCount: 12, createdAt: '2023-12-08T14:45:00Z' }
  ]

  // 模拟评论数据
  const mockComments = [
    { id: 1, content: '我一般会先制定一个详细的复习计划，然后按照计划每天执行。', postId: 1, postTitle: '如何高效准备期末考试？', username: 'user2', status: 'active', likesCount: 5, createdAt: '2023-12-10T15:45:00Z' },
    { id: 2, content: '我觉得高效记忆的关键是理解，而不是死记硬背。', postId: 1, postTitle: '如何高效准备期末考试？', username: 'user3', status: 'active', likesCount: 3, createdAt: '2023-12-10T16:10:00Z' }
  ]

  // 筛选帖子
  const filteredPosts = mockPosts.filter(post => 
    post.title.toLowerCase().includes(searchText.toLowerCase()) ||
    post.username.toLowerCase().includes(searchText.toLowerCase())
  )

  // 筛选评论
  const filteredComments = mockComments.filter(comment => 
    comment.content.toLowerCase().includes(searchText.toLowerCase()) ||
    comment.username.toLowerCase().includes(searchText.toLowerCase()) ||
    comment.postTitle.toLowerCase().includes(searchText.toLowerCase())
  )

  // 帖子状态标签配置
  const getPostStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>
      case 'pending':
        return <Tag color="orange">待审核</Tag>
      case 'deleted':
        return <Tag color="gray">已删除</Tag>
      case 'banned':
        return <Tag color="red">已封禁</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 帖子表格列配置
  const postColumns = [
    {
      title: '帖子ID',
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
          <EyeOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '板块',
      dataIndex: 'categoryName',
      key: 'categoryName',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: '作者',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getPostStatusTag(text)
    },
    {
      title: '点赞数',
      dataIndex: 'likesCount',
      key: 'likesCount'
    },
    {
      title: '评论数',
      dataIndex: 'commentsCount',
      key: 'commentsCount'
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id, 'post')}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  // 评论表格列配置
  const commentColumns = [
    {
      title: '评论ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
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
      title: '所属帖子',
      dataIndex: 'postTitle',
      key: 'postTitle',
      render: (text, record) => (
        <Space>
          <EyeOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '评论者',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: '点赞数',
      dataIndex: 'likesCount',
      key: 'likesCount'
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">
            编辑
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id, 'comment')}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleDelete = (id, type) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这个${type === 'post' ? '帖子' : '评论'}吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success(`${type === 'post' ? '帖子' : '评论'}删除成功`)
        // 这里可以添加删除逻辑
      }
    })
  }

  const handleTabChange = (key) => {
    setSelectedTab(key)
  }

  return (
    <div>
      <Title level={2}>内容管理</Title>
      
      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索帖子标题、内容或用户名"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
        </Space>
      </Card>

      {/* 标签页切换帖子和评论 */}
      <Tabs activeKey={selectedTab} onChange={handleTabChange}>
        <TabPane tab="帖子管理" key="posts">
          <Table
            columns={postColumns}
            dataSource={filteredPosts}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
        <TabPane tab="评论管理" key="comments">
          <Table
            columns={commentColumns}
            dataSource={filteredComments}
            rowKey="id"
            loading={loading}
            pagination={{ pageSize: 10 }}
          />
        </TabPane>
      </Tabs>
    </div>
  )
}

export default ContentManagement