import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Button, Space, Typography, Input, Form, Tag, Empty, Spin, Drawer, Modal, message, Layout } from 'antd'
import { 
  UserOutlined, MessageOutlined, SendOutlined, 
  CheckCircleOutlined, CloseCircleOutlined, BellOutlined, DeleteOutlined, ArrowLeftOutlined 
} from '@ant-design/icons'
import { useNavigate, useLocation } from 'react-router-dom'
import { messageAPI } from '../services/api'

const { Title, Text } = Typography
const { TextArea } = Input
const { Sider, Content } = Layout

const Messages = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [sendDrawerVisible, setSendDrawerVisible] = useState(false)
  const [form] = Form.useForm()
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [allMessages, setAllMessages] = useState([])
  
  // 检查是否有userId查询参数，如果有，导航到对话详情页
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search)
    const userId = searchParams.get('userId')
    if (userId) {
      // 移除查询参数，导航到动态路由
      navigate(`/messages/${userId}`)
    }
  }, [location.search, navigate])

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
      console.error('Request URL:', error.config?.url)
      console.error('Request method:', error.config?.method)
      console.error('Request headers:', error.config?.headers)
      console.error('Response status:', error.response?.status)
      console.error('Response data:', error.response?.data)
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

  // 获取所有消息
  const fetchAllMessages = async () => {
    setMessagesLoading(true)
    try {
      const response = await messageAPI.getMessages()
      if (response.success) {
        setAllMessages(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch all messages:', error)
    } finally {
      setMessagesLoading(false)
    }
  }

  // 发送私信
  const handleSendMessage = async (values) => {
    try {
      // 准备发送数据
      const messageData = values;
      
      const response = await messageAPI.sendMessage(messageData)
      if (response.success) {
        // 重新获取对话列表，确保新消息显示在对话列表中
        fetchConversations()
        // 重新获取所有消息，确保新消息显示在所有消息列表中
        fetchAllMessages()
        
        // 关闭发送私信抽屉
        setSendDrawerVisible(false)
        
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

  // 选择对话 - 导航到对话详情页
  const handleSelectConversation = (conversation) => {
    // 使用后端提供的conversation_partner字段获取对方用户ID
    const userId = conversation.conversation_partner?.id;
    // 导航到对话详情页
    navigate(`/messages/${userId}`)
  }

  // 打开发送私信抽屉
  const handleOpenDrawer = () => {
    setSendDrawerVisible(true)
  }

  // 关闭发送私信抽屉
  const handleCloseDrawer = () => {
    setSendDrawerVisible(false)
    form.resetFields()
  }

  // 打开删除确认模态框
  const handleDeleteMessage = (message) => {
    setMessageToDelete(message)
    setDeleteModalVisible(true)
  }

  // 关闭删除确认模态框
  const handleCloseDeleteModal = () => {
    setDeleteModalVisible(false)
    setMessageToDelete(null)
  }

  // 执行删除私信操作
  const handleConfirmDeleteMessage = async () => {
    if (!messageToDelete) return

    try {
      const response = await messageAPI.deleteMessage(messageToDelete.id)
      if (response.success) {
        message.success('私信删除成功')
        
        // 关闭删除确认模态框
        handleCloseDeleteModal()
        
        // 重新获取对话列表，确保删除的消息从列表中移除
        fetchConversations()
        // 重新获取所有消息，确保删除的消息从所有消息列表中移除
        fetchAllMessages()
      }
    } catch (error) {
      console.error('Failed to delete message:', error)
      message.error('删除私信失败')
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchConversations()
    fetchUnreadCount()
    fetchAllMessages()
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
                      <Button
                        type="link"
                        icon={<DeleteOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation(); // 阻止事件冒泡，避免触发对话选择
                          handleDeleteMessage(conversation);
                        }}
                        style={{ color: '#ff4d4f' }}
                      >
                        删除
                      </Button>
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
                        src={conversation.conversation_partner?.avatar}
                      />
                    }
                    title={
                      <Space>
                        <Text strong>
                          {conversation.conversation_partner?.username}
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
        open={sendDrawerVisible}
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

      {/* 删除确认模态框 */}
      <Modal
        title="删除私信"
        open={deleteModalVisible}
        onOk={handleConfirmDeleteMessage}
        onCancel={handleCloseDeleteModal}
        okText="确认删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除这条私信吗？删除后将无法恢复。</p>
      </Modal>
    </div>
  )
}

export default Messages