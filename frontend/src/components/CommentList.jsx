import React, { useState, useEffect } from 'react'
import { Card, List, Typography, Avatar, Form, Input, Button, Space, Pagination, message, Modal, Select } from 'antd'
import { LikeOutlined, CommentOutlined, DeleteOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons'

// 导入API服务
import { commentAPI } from '../services/api'

const { Title, Text } = Typography
const { TextArea } = Input

const CommentList = ({ postId, page = 1, pageSize = 10, onPageChange }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [commentsLoading, setCommentsLoading] = useState(false)
  // 举报功能状态
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportingCommentId, setReportingCommentId] = useState(null)
  const [reportReason, setReportReason] = useState('')
  const [reportLoading, setReportLoading] = useState(false)
  
  // 举报类型选项
  const reportTypeOptions = [
    { value: 'spam', label: '垃圾广告' },
    { value: 'pornography', label: '色情内容' },
    { value: 'violence', label: '暴力内容' },
    { value: 'other', label: '其他违规内容' }
  ]

  // 从API获取评论数据
  useEffect(() => {
    if (!postId) return
    
    const fetchComments = async () => {
      setCommentsLoading(true)
      try {
        const params = {
          page: page,
          limit: pageSize
        }
        const response = await commentAPI.getComments(postId, params)
        setComments(response.data?.comments || [])
        setTotal(response.data?.pagination?.totalItems || 0)
      } catch (error) {
        console.error('Failed to fetch comments:', error)
        setComments([])
        setTotal(0)
        message.error('获取评论失败')
      } finally {
        setCommentsLoading(false)
      }
    }

    fetchComments()
  }, [postId, page, pageSize])

  const displayComments = comments
  const displayTotal = total

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      await commentAPI.createComment(postId, values)
      message.success('评论发布成功')
      form.resetFields()
      // 重新获取评论列表
      const params = {
        page: 1, // 回到第一页
        limit: pageSize
      }
      const response = await commentAPI.getComments(postId, params)
      setComments(response.data?.comments || [])
      setTotal(response.data?.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Failed to submit comment:', error)
      message.error('评论发布失败')
    } finally {
      setLoading(false)
    }
  }

  const handleLike = async (commentId) => {
    try {
      await commentAPI.likeComment(postId, commentId)
      message.success('点赞成功')
      // 重新获取评论列表
      const params = {
        page: page,
        limit: pageSize
      }
      const response = await commentAPI.getComments(postId, params)
      setComments(response.data?.comments || [])
      setTotal(response.data?.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Failed to like comment:', error)
      message.error('点赞失败')
    }
  }

  const handleDelete = async (commentId) => {
    try {
      await commentAPI.deleteComment(postId, commentId)
      message.success('评论删除成功')
      // 重新获取评论列表
      const params = {
        page: page,
        limit: pageSize
      }
      const response = await commentAPI.getComments(postId, params)
      setComments(response.data?.comments || [])
      setTotal(response.data?.pagination?.totalItems || 0)
    } catch (error) {
      console.error('Failed to delete comment:', error)
      message.error('评论删除失败')
    }
  }
  
  // 打开举报模态框
  const handleOpenReportModal = (commentId) => {
    setReportingCommentId(commentId)
    setReportModalVisible(true)
    setReportReason('')
  }
  
  // 关闭举报模态框
  const handleCloseReportModal = () => {
    setReportModalVisible(false)
    setReportingCommentId(null)
    setReportReason('')
  }
  
  // 提交举报
  const handleSubmitReport = async () => {
    if (!reportingCommentId || !reportReason) {
      message.error('请选择举报类型')
      return
    }
    
    setReportLoading(true)
    try {
      await commentAPI.reportComment(reportingCommentId, {
        type: reportReason
      })
      message.success('举报成功，我们将尽快处理')
      handleCloseReportModal()
    } catch (error) {
      console.error('Failed to report comment:', error)
      message.error('举报失败，请稍后重试')
    } finally {
      setReportLoading(false)
    }
  }

  return (
    <div>
      {/* 评论表单 */}
      <Card title="发表评论" style={{ marginBottom: 24 }}>
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="content"
            rules={[{ required: true, message: '请输入评论内容!' }]}
          >
            <TextArea
              rows={4}
              placeholder="请输入评论内容"
              autoSize={{ minRows: 4, maxRows: 6 }}
            />
          </Form.Item>
          <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              size="large"
            >
              发表评论
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* 评论列表 */}
      <Card title={`评论列表 (${displayTotal})`}>
        <List
          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
          dataSource={displayComments}
          renderItem={(comment) => (
            <List.Item
              actions={[
                <Space size="middle">
                  <Button
                      type={comment.is_liked ? 'primary' : 'default'}
                      icon={<LikeOutlined />}
                      onClick={() => handleLike(comment.id)}
                      size="small"
                    >
                      {comment.likes_count}
                    </Button>
                  <Button
                    type="default"
                    icon={<ExclamationCircleOutlined />}
                    onClick={() => handleOpenReportModal(comment.id)}
                    size="small"
                  >
                    举报
                  </Button>
                  <Button
                    type="danger"
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(comment.id)}
                    size="small"
                  >
                    删除
                  </Button>
                </Space>
              ]}
              style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}
            >
              <List.Item.Meta
                avatar={<Avatar icon={<UserOutlined />} src={comment.user?.avatar} />}
                title={
                  <Space size="middle">
                    <Text strong>{comment.user?.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(comment.created_at).toLocaleString()}
                    </Text>
                  </Space>
                }
                description={comment.content}
              />
            </List.Item>
          )}
        />

        {/* 分页组件 */}
        {displayTotal > pageSize && (
          <div style={{ textAlign: 'center', marginTop: 24 }}>
            <Pagination
              current={page}
              pageSize={pageSize}
              total={displayTotal}
              onChange={onPageChange}
              showSizeChanger
              pageSizeOptions={['5', '10', '20']}
            />
          </div>
        )}
      </Card>
      
      {/* 举报模态框 */}
      <Modal
        title="举报评论"
        open={reportModalVisible}
        onOk={handleSubmitReport}
        onCancel={handleCloseReportModal}
        confirmLoading={reportLoading}
        okText="提交举报"
        cancelText="取消"
      >
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ marginBottom: 8 }}>请选择举报类型：</h4>
          <Select
            value={reportReason}
            onChange={setReportReason}
            style={{ width: '100%' }}
            options={reportTypeOptions}
            placeholder="请选择举报类型"
          />
        </div>
        <div>
          <h4>举报说明：</h4>
          <p style={{ color: '#999', fontSize: '14px' }}>请确保举报内容属实，恶意举报将受到处罚。</p>
        </div>
      </Modal>
    </div>
  )
}

export default CommentList