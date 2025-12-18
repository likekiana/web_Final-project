import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message, Tabs } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CheckCircleOutlined, CloseCircleOutlined, PushpinOutlined, PushpinTwoTone } from '@ant-design/icons'
import { adminAPI, commentAPI } from '../../services/api'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const ContentManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [contentType, setContentType] = useState('posts') // 'posts' or 'comments'
  const [selectedTab, setSelectedTab] = useState('posts')
  const [posts, setPosts] = useState([])
  const [comments, setComments] = useState([])
  const [postsLoading, setPostsLoading] = useState(false)
  const [commentsLoading, setCommentsLoading] = useState(false)
  
  // 编辑帖子相关状态
  const [editModalVisible, setEditModalVisible] = useState(false)
  const [editingPost, setEditingPost] = useState(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    content: '',
    category_id: '',
    status: ''
  })

  // 获取帖子列表
  const fetchPosts = async () => {
    setPostsLoading(true)
    try {
      const params = {
        page: 1,
        limit: 100,
        keyword: searchText
      }
      const response = await adminAPI.getPosts(params)
      if (response.success) {
        setPosts(response.data?.posts || [])
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      message.error('获取帖子列表失败')
      setPosts([])
    } finally {
      setPostsLoading(false)
    }
  }

  // 获取评论列表
  const fetchComments = async () => {
    setCommentsLoading(true)
    try {
      const params = {
        page: 1,
        limit: 100,
        keyword: searchText
      }
      // 注意：这里假设adminAPI有getComments方法，如果没有，需要调整
      const response = await adminAPI.getComments(params)
      if (response.success) {
        // Transform snake_case to camelCase and add missing fields
        const transformedComments = (response.data?.comments || []).map(comment => ({
          ...comment,
          username: comment.user?.username,
          postTitle: comment.post?.title,
          likesCount: comment.likes_count,
          createdAt: comment.created_at
        }))
        setComments(transformedComments)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
      message.error('获取评论列表失败')
      setComments([])
    } finally {
      setCommentsLoading(false)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchPosts()
    fetchComments()
  }, [searchText])

  // 筛选帖子
  const filteredPosts = posts.filter(post => 
    (post.title && post.title.toLowerCase().includes(searchText.toLowerCase())) ||
    (post.user && post.user.username && post.user.username.toLowerCase().includes(searchText.toLowerCase())) ||
    (post.category && post.category.name && post.category.name.toLowerCase().includes(searchText.toLowerCase()))
  )

  // 筛选评论
  const filteredComments = comments.filter(comment => 
    (comment.content && comment.content.toLowerCase().includes(searchText.toLowerCase())) ||
    (comment.user && comment.user.username && comment.user.username.toLowerCase().includes(searchText.toLowerCase())) ||
    (comment.post && comment.post.title && comment.post.title.toLowerCase().includes(searchText.toLowerCase()))
  )

  // 处理编辑帖子
  const handleEditPost = (post) => {
    setEditingPost(post)
    setEditFormData({
      title: post.title || '',
      content: post.content || '',
      category_id: post.category?.id || '',
      status: post.status || 'normal'
    })
    setEditModalVisible(true)
  }

  // 处理表单数据变化
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 处理编辑表单提交
  const handleEditSubmit = async () => {
    if (!editingPost) return
    
    setLoading(true)
    try {
      const response = await adminAPI.updatePost(editingPost.id, editFormData)
      if (response.success) {
        message.success('帖子编辑成功')
        setEditModalVisible(false)
        fetchPosts() // 重新获取帖子列表
      }
    } catch (error) {
      console.error('Failed to edit post:', error)
      message.error('帖子编辑失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理关闭编辑模态框
  const handleEditModalClose = () => {
    setEditModalVisible(false)
    setEditingPost(null)
  }

  // 帖子状态标签配置
  const getPostStatusTag = (status) => {
    switch (status) {
      case 'normal':
        return <Tag color="green">正常</Tag>
      case 'hidden':
        return <Tag color="gray">隐藏</Tag>
      case 'active':
        return <Tag color="green">活跃</Tag>
      case 'pending':
        return <Tag color="orange">待审核</Tag>
      case 'deleted':
        return <Tag color="gray">已删除</Tag>
      case 'banned':
        return <Tag color="red">已封禁</Tag>
      case 'reported':
        return <Tag color="yellow">已举报</Tag>
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
      width: 80,
      ellipsis: true
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <Space>
          <EyeOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '板块',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category) => <Tag color="blue">{category?.name || '未分类'}</Tag>
    },
    {
      title: '作者',
      dataIndex: 'user',
      key: 'user',
      width: 120,
      render: (user) => <>{user?.username || '未知'}</>,
      ellipsis: true
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (text) => getPostStatusTag(text)
    },
    {
      title: '点赞数',
      dataIndex: 'likes_count',
      key: 'likes_count',
      width: 80
    },
    {
      title: '评论数',
      dataIndex: 'comments_count',
      key: 'comments_count',
      width: 80
    },
    {
      title: '发布时间',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 180,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 240,
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEditPost(record)}>
            编辑
          </Button>
          {record.is_sticky ? (
            <Button type="default" icon={<PushpinTwoTone />} size="small" onClick={() => handleUnpinPost(record.id)}>
              取消置顶
            </Button>
          ) : (
            <Button type="success" icon={<PushpinOutlined />} size="small" onClick={() => handlePinPost(record.id)}>
              置顶
            </Button>
          )}
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
      ellipsis: true,
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
      key: 'username',
      width: 120,
      ellipsis: true
    },
    {
      title: '点赞数',
      dataIndex: 'likesCount',
      key: 'likesCount',
      width: 80
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      ellipsis: true
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: (_, record) => (
        <Space size="middle">
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

  const handleDelete = async (id, type) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除这个${type === 'post' ? '帖子' : '评论'}吗？`,
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        try {
          if (type === 'post') {
            const response = await adminAPI.deletePost(id)
            if (response.success) {
              message.success('帖子删除成功')
              fetchPosts() // 重新获取帖子列表
            }
          } else {
            // 注意：这里假设adminAPI有deleteComment方法，如果没有，需要调整为合适的API调用
            const response = await adminAPI.deleteComment(id)
            if (response.success) {
              message.success('评论删除成功')
              fetchComments() // 重新获取评论列表
            }
          }
        } catch (error) {
          console.error(`Failed to delete ${type}:`, error)
          message.error(`${type === 'post' ? '帖子' : '评论'}删除失败`)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // 置顶帖子
  const handlePinPost = async (id) => {
    try {
      setLoading(true)
      const response = await adminAPI.pinPost(id)
      if (response.success) {
        message.success('帖子已置顶')
        fetchPosts() // 重新获取帖子列表
      }
    } catch (error) {
      console.error('Failed to pin post:', error)
      message.error('帖子置顶失败')
    } finally {
      setLoading(false)
    }
  }

  // 取消帖子置顶
  const handleUnpinPost = async (id) => {
    try {
      setLoading(true)
      const response = await adminAPI.unpinPost(id)
      if (response.success) {
        message.success('帖子已取消置顶')
        fetchPosts() // 重新获取帖子列表
      }
    } catch (error) {
      console.error('Failed to unpin post:', error)
      message.error('取消帖子置顶失败')
    } finally {
      setLoading(false)
    }
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

      {/* 编辑帖子模态框 */}
      <Modal
        title="编辑帖子"
        open={editModalVisible}
        onOk={handleEditSubmit}
        onCancel={handleEditModalClose}
        confirmLoading={loading}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* 标题输入 */}
          <div>
            <Typography.Text strong>标题</Typography.Text>
            <Input
              value={editFormData.title}
              onChange={(e) => handleEditFormChange('title', e.target.value)}
              placeholder="请输入帖子标题"
              style={{ marginTop: 8 }}
            />
          </div>

          {/* 内容输入 */}
          <div>
            <Typography.Text strong>内容</Typography.Text>
            <Input.TextArea
              value={editFormData.content}
              onChange={(e) => handleEditFormChange('content', e.target.value)}
              placeholder="请输入帖子内容"
              rows={6}
              style={{ marginTop: 8 }}
            />
          </div>

          {/* 状态选择 */}
          <div>
            <Typography.Text strong>状态</Typography.Text>
            <Select
              value={editFormData.status}
              onChange={(value) => handleEditFormChange('status', value)}
              style={{ width: '100%', marginTop: 8 }}
            >
              <Option value="normal">正常</Option>
              <Option value="hidden">隐藏</Option>
            </Select>
          </div>
        </div>
      </Modal>

      {/* 标签页切换帖子和评论 */}
      <Tabs
        activeKey={selectedTab}
        onChange={handleTabChange}
        items={[
          {
            key: 'posts',
            label: '帖子管理',
            children: (
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={postColumns}
                  dataSource={filteredPosts}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                  style={{ minWidth: '800px' }}
                />
              </div>
            ),
          },
          {
            key: 'comments',
            label: '评论管理',
            children: (
              <div style={{ overflowX: 'auto' }}>
                <Table
                  columns={commentColumns}
                  dataSource={filteredComments}
                  rowKey="id"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 'max-content' }}
                  style={{ minWidth: '800px' }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  )
}

export default ContentManagement