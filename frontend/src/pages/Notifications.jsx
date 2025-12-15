import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Button, Space, Typography, Tag, Empty, Spin } from 'antd'
import { 
  BellOutlined, EyeOutlined, StarOutlined, MessageOutlined, 
  UserOutlined, FileTextOutlined, CheckCircleOutlined, 
  CloseCircleOutlined, PushpinOutlined 
} from '@ant-design/icons'
import { notificationAPI } from '../services/api'

const { Title, Text } = Typography

const Notifications = () => {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)

  // 通知图标映射
  const notificationIconMap = {
    like: <StarOutlined style={{ color: '#ffd700' }} />,
    comment: <MessageOutlined style={{ color: '#1890ff' }} />,
    follow: <UserOutlined style={{ color: '#52c41a' }} />,
    report: <FileTextOutlined style={{ color: '#faad14' }} />,
    system: <BellOutlined style={{ color: '#1890ff' }} />,
    admin: <UserOutlined style={{ color: '#f5222d' }} />
  }

  // 获取通知列表
  const fetchNotifications = async () => {
    setLoading(true)
    try {
      const response = await notificationAPI.getNotifications()
      if (response.success) {
        setNotifications(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  // 获取未读通知数量
  const fetchUnreadCount = async () => {
    try {
      const response = await notificationAPI.getUnreadCount()
      if (response.success) {
        setUnreadCount(response.data.unread_count || 0)
      }
    } catch (error) {
      console.error('Failed to fetch unread count:', error)
    }
  }

  // 标记所有通知为已读
  const handleMarkAllAsRead = async () => {
    try {
      const response = await notificationAPI.markAllAsRead()
      if (response.success) {
        fetchNotifications()
        fetchUnreadCount()
      }
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  // 初始化数据
  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [])

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <Title level={2}>通知中心</Title>
        {unreadCount > 0 && (
          <Button 
            type="primary" 
            icon={<CheckCircleOutlined />} 
            onClick={handleMarkAllAsRead}
          >
            标记所有为已读
          </Button>
        )}
      </div>

      <Card>
        <Spin spinning={loading}>
          {notifications.length > 0 ? (
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
              dataSource={notifications}
              renderItem={(notification) => (
                <List.Item
                  key={notification.id}
                  actions={[
                    <Space size="middle">
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        {notification.created_at}
                      </Text>
                    </Space>
                  ]}
                  style={{
                    marginBottom: 16,
                    padding: 16,
                    border: `1px solid #f0f0f0`,
                    borderRadius: 8,
                    backgroundColor: notification.is_unread ? '#f0f7ff' : '#fff'
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar icon={notificationIconMap[notification.notification_type] || <BellOutlined />} />
                    }
                    title={
                      <Space>
                        <Text strong>{notification.title}</Text>
                        {notification.is_unread && (
                          <Tag color="blue">未读</Tag>
                        )}
                      </Space>
                    }
                    description={
                      <div>
                        <Text>{notification.content}</Text>
                        {notification.post && (
                          <div style={{ marginTop: 8 }}>
                            <Button 
                              type="link" 
                              icon={<EyeOutlined />} 
                              size="small"
                              href={`/posts/${notification.post.id}`}
                              target="_blank"
                            >
                              查看帖子
                            </Button>
                          </div>
                        )}
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
                <span>暂无通知</span>
              }
            />
          )}
        </Spin>
      </Card>
    </div>
  )
}

export default Notifications