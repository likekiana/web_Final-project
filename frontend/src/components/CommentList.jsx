import React, { useState } from 'react'
import { Card, List, Typography, Avatar, Form, Input, Button, Space, Pagination, message } from 'antd'
import { LikeOutlined, CommentOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'

const { Title, Text } = Typography
const { TextArea } = Input

const CommentList = ({ postId, comments = [], total = 0, page = 1, pageSize = 10, onPageChange }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  // 模拟评论数据
  const mockComments = [
    {
      id: 1,
      content: '我一般会先制定一个详细的复习计划，然后按照计划每天执行。',
      postId: 1,
      userId: 2,
      username: 'user2',
      avatar: null,
      likesCount: 5,
      createdAt: '2023-12-10T15:45:00Z',
      isLiked: false
    },
    {
      id: 2,
      content: '我觉得高效记忆的关键是理解，而不是死记硬背。',
      postId: 1,
      userId: 3,
      username: 'user3',
      avatar: null,
      likesCount: 3,
      createdAt: '2023-12-10T16:10:00Z',
      isLiked: true
    },
    {
      id: 3,
      content: '处理压力的话，我会适当放松一下，比如运动或者听音乐。',
      postId: 1,
      userId: 4,
      username: 'user4',
      avatar: null,
      likesCount: 2,
      createdAt: '2023-12-10T16:30:00Z',
      isLiked: false
    }
  ]

  const displayComments = comments.length > 0 ? comments : mockComments
  const displayTotal = total > 0 ? total : mockComments.length

  const handleSubmit = (values) => {
    setLoading(true)
    // 模拟提交评论请求
    setTimeout(() => {
      message.success('评论发布成功')
      form.resetFields()
      setLoading(false)
    }, 1000)
  }

  const handleLike = (commentId) => {
    message.success('点赞成功')
    // 这里可以添加点赞逻辑
  }

  const handleDelete = (commentId) => {
    message.success('评论删除成功')
    // 这里可以添加删除评论逻辑
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
                    type={comment.isLiked ? 'primary' : 'default'}
                    icon={<LikeOutlined />}
                    onClick={() => handleLike(comment.id)}
                    size="small"
                  >
                    {comment.likesCount}
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
                avatar={<Avatar icon={<UserOutlined />} src={comment.avatar} />}
                title={
                  <Space size="middle">
                    <Text strong>{comment.username}</Text>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(comment.createdAt).toLocaleString()}
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
    </div>
  )
}

export default CommentList