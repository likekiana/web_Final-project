import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Avatar, Space, Tag, Spin } from 'antd'
import { ArrowLeftOutlined, LikeOutlined, CommentOutlined, EyeOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

// 导入API服务
import { postAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography

const PostDetail = ({ postId }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // 从API获取帖子详情
  useEffect(() => {
    const fetchPostDetail = async () => {
      if (!postId) return
      
      setLoading(true)
      try {
        const response = await postAPI.getPostDetail(postId)
        setPost(response.data)
        setError(null)
      } catch (err) {
        console.error('Failed to fetch post detail:', err)
        setError('获取帖子详情失败')
        setPost(null)
      } finally {
        setLoading(false)
      }
    }

    fetchPostDetail()
  }, [postId])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载中...</p>
      </div>
    )
  }

  if (error || !post) {
    return (
      <Card style={{ marginBottom: 24 }}>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <Text type="danger">{error || '帖子不存在'}</Text>
          <br />
          <Link to="/">
            <Button 
              icon={<ArrowLeftOutlined />} 
              style={{ marginTop: 16 }}
            >
              返回列表
            </Button>
          </Link>
        </div>
      </Card>
    )
  }

  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>{post.title}</Title>
          <Link to="/">
            <Button 
              icon={<ArrowLeftOutlined />} 
            >
              返回列表
            </Button>
          </Link>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      {/* 帖子元信息 */}
      <Space style={{ marginBottom: 16 }}>
        <Tag color="blue">{post.categoryName}</Tag>
        {post.type === 'trade' && <Tag color="orange">交易</Tag>}
        {post.type === 'advertisement' && <Tag color="red">广告</Tag>}
      </Space>

      {/* 帖子内容 */}
      <Paragraph style={{ margin: '24px 0' }}>
        {post.content}
      </Paragraph>

      {/* 帖子作者信息和统计 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
        <Space>
          <Avatar icon={<UserOutlined />} src={post.user?.avatar} size={40} />
          <div>
            <Text strong>{post.user?.username}</Text>
            <br />
            <Text type="secondary" style={{ fontSize: 12 }}>
              {new Date(post.created_at).toLocaleString()}
            </Text>
          </div>
        </Space>
        
        <Space size="middle" style={{ marginLeft: 'auto' }}>
          <Space>
            <EyeOutlined />
            <Text type="secondary">{post.viewsCount || 0}</Text>
          </Space>
          <Space>
            <CommentOutlined />
            <Text type="secondary">{post.commentsCount || 0}</Text>
          </Space>
          <Space>
            <LikeOutlined />
            <Text type="secondary">{post.likesCount || 0}</Text>
          </Space>
        </Space>
      </div>
    </Card>
  )
}

export default PostDetail