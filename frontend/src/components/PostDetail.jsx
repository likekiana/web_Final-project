import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Avatar, Space, Tag, Spin, Modal, Select, message } from 'antd'
import { ArrowLeftOutlined, LikeOutlined, CommentOutlined, EyeOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

// 导入API服务
import { postAPI, reportAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography

const PostDetail = ({ postId }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // 举报相关状态
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)

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

  // 处理举报提交
  const handleReportSubmit = async () => {
    if (!reportType) {
      message.error('请选择举报类型')
      return
    }
    
    setReporting(true)
    try {
      const response = await reportAPI.reportPost(postId, {
        type: reportType,
        reason: reportReason
      })
      if (response.success) {
        message.success('举报成功，我们将尽快处理')
        setReportModalVisible(false)
        setReportType('')
        setReportReason('')
      } else {
        message.error(response.message || '举报失败，请稍后重试')
      }
    } catch (error) {
      console.error('Report submission error:', error)
      message.error('举报失败，请稍后重试')
    } finally {
      setReporting(false)
    }
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
        <Tag color="blue">{post.category?.name || '未分类'}</Tag>
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
            <Text type="secondary">{post.views_count || 0}</Text>
          </Space>
          <Space>
            <CommentOutlined />
            <Text type="secondary">{post.comments_count || 0}</Text>
          </Space>
          <Space>
            <LikeOutlined />
            <Text type="secondary">{post.likes_count || 0}</Text>
          </Space>
          <Button 
            type="default" 
            danger
            icon={<ExclamationCircleOutlined />}
            size="small"
            onClick={() => setReportModalVisible(true)}
          >
            举报
          </Button>
        </Space>
      </div>
    </Card>
    
    {/* 举报模态框 */}
    <Modal
      title="举报帖子"
      open={reportModalVisible}
      onOk={handleReportSubmit}
      onCancel={() => setReportModalVisible(false)}
      confirmLoading={reporting}
      okText="提交举报"
      cancelText="取消"
      width={500}
    >
      <div style={{ marginTop: 20 }}>
        <p style={{ marginBottom: 8 }}><strong>举报类型:</strong></p>
        <Select
          style={{ width: '100%', marginBottom: 16 }}
          placeholder="请选择举报类型"
          value={reportType}
          onChange={setReportType}
        >
          <Select.Option value="spam">垃圾广告</Select.Option>
          <Select.Option value="pornography">色情内容</Select.Option>
          <Select.Option value="violence">暴力内容</Select.Option>
          <Select.Option value="other">其他违规</Select.Option>
        </Select>
        
        <p style={{ marginBottom: 8 }}><strong>举报原因:</strong></p>
        <textarea
          style={{ 
            width: '100%', 
            height: 120, 
            padding: 8, 
            border: '1px solid #d9d9d9',
            borderRadius: 4,
            resize: 'vertical'
          }}
          placeholder="请详细描述举报原因（可选）"
          value={reportReason}
          onChange={(e) => setReportReason(e.target.value)}
        />
      </div>
    </Modal>
  )
}

export default PostDetail