import React from 'react'
import { Card, Typography, Row, Col, Button, List, Avatar, Space } from 'antd'
import { EditOutlined, LogoutOutlined, BookOutlined, UserOutlined, CommentOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography

const Profile = () => {
  const navigate = useNavigate()

  // 模拟用户数据
  const user = {
    id: 1,
    username: 'testuser',
    email: 'test@example.edu.cn',
    avatar: null,
    bio: '热爱学习和分享的大学生',
    createdAt: '2023-09-01',
    postsCount: 10,
    commentsCount: 20,
    likesCount: 50
  }

  // 模拟帖子数据
  const posts = [
    {
      id: 1,
      title: '如何高效准备期末考试？',
      content: '马上就要期末考试了，大家有什么好的复习方法分享吗？',
      createdAt: '2023-12-10T15:45:00Z',
      likesCount: 5,
      commentsCount: 3
    },
    {
      id: 2,
      title: '推荐一本好书《高效能人士的七个习惯》',
      content: '最近读了一本好书，推荐给大家...',
      createdAt: '2023-12-08T10:30:00Z',
      likesCount: 8,
      commentsCount: 5
    }
  ]

  const handleLogout = () => {
    // 实现退出登录逻辑
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div>
      <Title level={2}>个人资料</Title>
      
      <Row gutter={[24, 24]}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} md={8}>
          <Card title="用户信息" hoverable>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={100}
                icon={<UserOutlined />}
                src={user.avatar}
                style={{ marginBottom: 16 }}
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>{user.username}</Title>
                <Text type="secondary">{user.email}</Text>
              </div>
            </div>
            
            <Paragraph style={{ marginBottom: 24 }}>{user.bio}</Paragraph>
            
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>注册时间：</Text>
                <Text type="secondary">{new Date(user.createdAt).toLocaleDateString()}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>发帖数：</Text>
                <Text strong>{user.postsCount}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>评论数：</Text>
                <Text strong>{user.commentsCount}</Text>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <Text>获赞数：</Text>
                <Text strong>{user.likesCount}</Text>
              </div>
            </Space>
            
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Button type="primary" icon={<EditOutlined />} block>
                编辑资料
              </Button>
              <Button danger icon={<LogoutOutlined />} block onClick={handleLogout}>
                退出登录
              </Button>
            </div>
          </Card>
        </Col>
        
        {/* 右侧帖子列表 */}
        <Col xs={24} md={16}>
          <Card title="我的发帖" hoverable>
            <List
              grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
              dataSource={posts}
              renderItem={(post) => (
                <List.Item
                  actions={[
                    <Space size="middle">
                      <Text type="secondary">
                        <BookOutlined style={{ marginRight: 4 }} />
                        {post.likesCount} 点赞
                      </Text>
                      <Text type="secondary">
                        <CommentOutlined style={{ marginRight: 4 }} />
                        {post.commentsCount} 评论
                      </Text>
                    </Space>
                  ]}
                  style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}
                >
                  <List.Item.Meta
                    title={
                      <Link to={`/posts/${post.id}`}>{post.title}</Link>
                    }
                    description={
                      <div>
                        <Paragraph ellipsis={{ rows: 2 }}>{post.content}</Paragraph>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {new Date(post.createdAt).toLocaleString()}
                        </Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default Profile
