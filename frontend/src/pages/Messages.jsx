import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Button, Space, Typography, Input, Form, Tag, Empty, Spin, Drawer } from 'antd'
import { 
  UserOutlined, MessageOutlined, SendOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, BellOutlined 
} from '@ant-design/icons'
import { messageAPI } from '../services/api'

const { Title, Text } = Typography
const { TextArea } = Input

const Messages = () => {
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [form] = Form.useForm()

  // 获取对话列表
  const fetchConversations = async () => {
    setLoading(true)
    try {
      const response = await messageAPI.getConversations()
      if (response.success) {
        setConversations(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取未读私信数量
  const fetchUnreadCount = async () => {
    try {
      const response = await messageAPI.getUnreadMessageCount()
      if (response.success) {
        setUnreadCount(response.data.unread_count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  // 获取与特定用户的对话
  const fetchConversationMessages = async (userId) => {
    setMessagesLoading(true)
    try {
      const response = await messageAPI.getConversationWithUser(userId)
      if (response.success) {
        setMessages(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // 发送私信
  const handleSendMessage = async (values) => {
    if (!selectedConversation) return

    try {
      const recipientId = selectedConversation.sender?.id || selectedConversation.recipient.id
      const response = await messageAPI.sendMessage({
        ...values,
        recipient_id: recipientId
      })
      if (response.success) {
        // 重新获取对话消息
        fetchConversationMessages(recipientId)
        // 重新获取对话列表
        fetchConversations()
        // 重置表单
        form.resetFields()
      }
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 标记所有私信为已读
  const handleMarkAllAsRead = async () => {
    try {
      const response = await messageAPI.markAllMessagesAsRead()
      if (response.success) {
        fetchConversations()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Failed to mark all messages as read:', error)
    }
  }

  // 选择对话
  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation)
    const userId = conversation.sender?.id || conversation.recipient.id
    fetchConversationMessages(userId)
  }

  // 打开发送私信抽屉
  const handleOpenDrawer = () => {
    setDrawerVisible(true)
  }

  // 关闭发送私信抽屉
  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    form.resetFields()
  }

  // 初始化数据
  useEffect(() => {
    fetchConversations()
    fetchUnreadCount()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>私信中心</Title>
        <Space>
          {unreadCount > 0 && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              onClick={handleMarkAllAsRead}
            >
              标记所有为已读
            </Button>
          )}
          <Button 
            type="primary" 
            icon={<SendOutlined />} 
            onClick={handleOpenDrawer}
          >
            发送私信
          </Button>
        </Space>
      </div>

      <Card>
        <Spin spinning={loading}>
          {conversations.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
              dataSource={conversations}
              renderItem={(conversation) => (
                <List.Item
                  key={conversation.id}
                  onClick={() => handleSelectConversation(conversation)}
                  actions={[
                    <Space size="middle">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {conversation.created_at}
                      </Text>
                    </Space>
                  ]}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    border: `1px solid #f0f0f0`,
                    borderRadius: 8,
                    backgroundColor: conversation.is_unread ? '#f0f7ff' : '#fff',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#fafafa'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = conversation.is_unread ? '#f0f7ff' : '#fff'}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={conversation.sender?.avatar || conversation.recipient.avatar}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>
                          {conversation.sender?.username || conversation.recipient.username}
                        </Text>
                        {conversation.is_unread && (
                          <Tag color="blue">未读</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Text ellipsis style={{ maxWidth: 400 }}>
                          {conversation.content}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span>暂无私信</span>
              }
            />
          )}
        </Spin>
      </Card>

      {/* 发送私信抽屉 */}
      <Drawer
        title="发送私信"
        placement="right"
        onClose={handleCloseDrawer}
        open={drawerVisible}
        width={400}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSendMessage}
        >
          <Form.Item
            name="recipient_id"
            label="收件人ID"
            rules={[{ required: true, message: '请输入收件人ID' }]}
          >
            <Input placeholder="请输入收件人ID" />
          </Form.Item>
          
          <Form.Item
            name="subject"
            label="主题"
            rules={[{ required: false, max: 50 }]}
          >
            <Input placeholder="请输入私信主题" />
          </Form.Item>
          
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入私信内容' }, { min: 1, max: 2000 }]}
          >
            <TextArea 
              rows={6} 
              placeholder="请输入私信内容"
            />
          </Form.Item>
          
          <Form.Item>
            <Space size="middle">
              <Button type="primary" htmlType="submit">
                发送
              </Button>
              <Button onClick={handleCloseDrawer}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Drawer>

      {/* 对话详情 */}
      {selectedConversation && (
        <Drawer
          title={`与 ${selectedConversation.sender?.username || selectedConversation.recipient.username} 的对话`}
          placement="right"
          onClose={() => setSelectedConversation(null)}
          open={!!selectedConversation}
          width={600}
        >
          <Spin spinning={messagesLoading}>
            {messages.length > 0 ? (
              <div style={{ maxHeight: 400, overflowY: 'auto', marginBottom: 20 }}>
                {messages.map((msg) => (
                  <div 
                    key={msg.id}
                    style={{
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: msg.sender?.id === selectedConversation.sender?.id ? 'flex-end' : 'flex-start'
                    }}
                  >
                    <div
                      style={{
                        maxWidth: '70%',
                        padding: 12,
                        borderRadius: 8,
                        backgroundColor: msg.sender?.id === selectedConversation.sender?.id ? '#1890ff' : '#f0f0f0',
                        color: msg.sender?.id === selectedConversation.sender?.id ? '#fff' : '#000'
                      }}
                    >
                      <div style={{ marginBottom: 4, fontWeight: 'bold' }}>
                        {msg.sender?.username || '系统'}
                      </div>
                      <div>{msg.content}</div>
                      <div style={{ marginTop: 4, fontSize: 12, opacity: 0.7 }}>
                        {msg.created_at}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>暂无消息</span>
                }
                style={{ margin: '50px 0' }}
              />
            )}
          </Spin>
          
          <Form
            form={form}
            layout="inline"
            onFinish={handleSendMessage}
            style={{ marginTop: 20 }}
          >
            <Form.Item
              name="content"
              rules={[{ required: true, message: '请输入消息内容' }]}
            >
              <TextArea
                rows={3}
                placeholder="请输入消息内容"
                style={{ width: '80%' }}
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" icon={<SendOutlined />}>
                发送
              </Button>
            </Form.Item>
          </Form>
        </Drawer>
      )}
    </div>
  )
}

export default Messages