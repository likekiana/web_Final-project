import React, { useState, useEffect } from 'react'
import { Card, Typography, Form, Input, Button, Select, Space, List, Tag, Divider, Spin, message } from 'antd'
import { PlusOutlined, ArrowLeftOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { feedbackAPI } from '../services/api'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input

const Feedback = () => {
  const navigate = useNavigate()
  const [form] = Form.useForm()
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)

  // 获取用户反馈列表
  const fetchFeedbacks = async () => {
    setLoading(true)
    try {
      const response = await feedbackAPI.getUserFeedbacks()
      if (response.success) {
        setFeedbacks(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch feedbacks:', error)
      message.error('获取反馈列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始化加载反馈列表
  useEffect(() => {
    fetchFeedbacks()
  }, [])

  // 处理表单提交
  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      const response = await feedbackAPI.createFeedback(values)
      if (response.success) {
        message.success('反馈提交成功，感谢您的建议！')
        form.resetFields()
        setShowForm(false)
        fetchFeedbacks() // 刷新反馈列表
      } else {
        message.error(response.message || '反馈提交失败')
      }
    } catch (error) {
      console.error('Feedback submission error:', error)
      message.error('反馈提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 状态标签映射
  const statusMap = {
    pending: { color: 'orange', text: '待处理' },
    processing: { color: 'blue', text: '处理中' },
    resolved: { color: 'green', text: '已解决' },
    rejected: { color: 'red', text: '已驳回' }
  }

  // 反馈类型映射
  const typeMap = {
    suggestion: { color: 'blue', text: '功能建议' },
    bug: { color: 'red', text: 'Bug反馈' },
    other: { color: 'gray', text: '其他反馈' }
  }

  return (
    <div>
      {/* 页面标题 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2} style={{ margin: 0 }}>功能反馈</Title>
        <Link to="/">
          <Button icon={<ArrowLeftOutlined />}>返回首页</Button>
        </Link>
      </div>

      {/* 反馈说明 */}
      <Card style={{ marginBottom: 24 }}>
        <Paragraph>
          欢迎您对我们的系统提出宝贵的意见和建议！您的反馈将帮助我们不断改进产品，提升用户体验。
        </Paragraph>
        <Paragraph>
          您可以反馈功能建议、Bug问题或其他相关内容，我们会尽快处理并回复您。
        </Paragraph>
      </Card>

      {/* 新建反馈按钮 */}
      <Button 
        type="primary" 
        icon={<PlusOutlined />} 
        onClick={() => setShowForm(!showForm)}
        style={{ marginBottom: 16 }}
      >
        {showForm ? '取消新建' : '提交反馈'}
      </Button>

      {/* 反馈表单 */}
      {showForm && (
        <Card title="提交反馈" style={{ marginBottom: 24 }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
          >
            <Form.Item
              name="type"
              label="反馈类型"
              rules={[{ required: true, message: '请选择反馈类型' }]}
            >
              <Select placeholder="请选择反馈类型">
                <Select.Option value="suggestion">功能建议</Select.Option>
                <Select.Option value="bug">Bug反馈</Select.Option>
                <Select.Option value="other">其他反馈</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="title"
              label="反馈标题"
              rules={[{ required: true, message: '请输入反馈标题' }]}
            >
              <Input placeholder="请输入反馈标题" maxLength={200} />
            </Form.Item>

            <Form.Item
              name="content"
              label="反馈内容"
              rules={[{ required: true, message: '请输入反馈内容' }]}
            >
              <TextArea 
                placeholder="请详细描述您的反馈内容，包括问题复现步骤、期望的功能等" 
                rows={6} 
                maxLength={5000}
              />
            </Form.Item>

            <Form.Item
              name="contact_info"
              label="联系方式（可选）"
            >
              <Input placeholder="请输入邮箱或电话，方便我们联系您" maxLength={200} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交反馈
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}

      {/* 反馈列表 */}
      <Card title="我的反馈">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Spin size="large" />
            <p style={{ marginTop: 16 }}>加载中...</p>
          </div>
        ) : feedbacks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 0' }}>
            <Text type="secondary">您还没有提交过反馈</Text>
            <br />
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => setShowForm(true)}
              style={{ marginTop: 16 }}
            >
              提交第一条反馈
            </Button>
          </div>
        ) : (
          <List
            dataSource={feedbacks}
            renderItem={(feedback) => (
              <List.Item
                key={feedback.id}
                extra={
                  <Tag color={statusMap[feedback.status]?.color || 'gray'}>
                    {statusMap[feedback.status]?.text || feedback.status}
                  </Tag>
                }
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Tag color={typeMap[feedback.type]?.color || 'gray'}>
                        {typeMap[feedback.type]?.text || feedback.type}
                      </Tag>
                      <Text strong>{feedback.title}</Text>
                    </Space>
                  }
                  description={(
                    <div>
                      <Paragraph ellipsis={{ rows: 2 }}>
                        {feedback.content}
                      </Paragraph>
                      <Space style={{ marginTop: 8 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          提交时间：{new Date(feedback.created_at).toLocaleString()}
                        </Text>
                        {feedback.reply && (
                          <>
                            <Divider type="vertical" />
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              回复时间：{new Date(feedback.processed_at).toLocaleString()}
                            </Text>
                          </>
                        )}
                      </Space>
                      {feedback.reply && (
                        <div style={{ marginTop: 8, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 4 }}>
                          <Text strong style={{ display: 'block', marginBottom: 4 }}>回复：</Text>
                          <Paragraph>{feedback.reply}</Paragraph>
                        </div>
                      )}
                    </div>
                  )}
                />
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}

export default Feedback