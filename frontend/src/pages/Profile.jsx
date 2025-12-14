import React, { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Button, List, Avatar, Space, Spin, message, Form, Input, Upload, Tabs, Empty } from 'antd'
import { EditOutlined, LogoutOutlined, BookOutlined, UserOutlined, CommentOutlined, SaveOutlined, CloseOutlined, UploadOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI, userAPI, historyAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [browsingHistory, setBrowsingHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)

  // 获取当前用户信息
  useEffect(() => {
    const fetchCurrentUser = async () => {
      setLoading(true)
      try {
        const response = await authAPI.getCurrentUser()
        if (response.success) {
          setUser(response.data)
          form.setFieldsValue({
            username: response.data.username,
            bio: response.data.bio || ''
          })
          // 获取用户帖子
          const postsResponse = await userAPI.getUserPosts(response.data.id)
          if (postsResponse.success) {
            setPosts(postsResponse.data?.posts || [])
          }
        }
      } catch (error) {
        console.error('Failed to fetch user info:', error)
        message.error('获取用户信息失败')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [form])

  // 获取浏览历史
  const fetchBrowsingHistory = async () => {
    setHistoryLoading(true)
    try {
      const response = await historyAPI.getBrowsingHistory()
      if (response.success) {
        setBrowsingHistory(response.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch browsing history:', error)
      message.error('获取浏览历史失败')
    } finally {
      setHistoryLoading(false)
    }
  }

  // 清空浏览历史
  const handleClearHistory = async () => {
    try {
      const response = await historyAPI.clearBrowsingHistory()
      if (response.success) {
        setBrowsingHistory([])
        message.success('浏览历史已清空')
      }
    } catch (error) {
      console.error('Failed to clear browsing history:', error)
      message.error('清空浏览历史失败')
    }
  }

  // 当选项卡切换到浏览历史时获取数据
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBrowsingHistory()
    }
  }, [activeTab])



  const handleLogout = () => {
    // 实现退出登录逻辑
    localStorage.removeItem('token')
    navigate('/login')
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  const handleCancelEdit = () => {
    setIsEditing(false)
    form.setFieldsValue({
      username: user.username,
      bio: user.bio || ''
    })
  }

  const handleSaveProfile = async (values) => {
    setSaveLoading(true)
    try {
      // 创建FormData对象处理文件上传
      const formData = new FormData();
      formData.append('username', values.username);
      formData.append('bio', values.bio || '');
      if (avatarFile) {
        formData.append('avatar_file', avatarFile);
      }
      
      const response = await userAPI.updateUserInfo(user.id, formData, true)
      if (response.success) {
        setUser(response.data)
        setIsEditing(false)
        setAvatarFile(null)
        setAvatarPreview(null)
        message.success('资料更新成功')
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      message.error('更新资料失败')
    } finally {
      setSaveLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载中...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Text type="danger">获取用户信息失败</Text>
        <br />
        <Button
          type="primary"
          icon={<LogoutOutlined />}
          onClick={handleLogout}
          style={{ marginTop: 16 }}
        >
          返回登录
        </Button>
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>个人资料</Title>
      
      <Row gutter={[24, 24]}>
        {/* 左侧用户信息卡片 */}
        <Col xs={24} md={8}>
          <Card title="用户信息" hoverable>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              {isEditing ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSaveProfile}
                  style={{ marginTop: 16 }}
                  encType="multipart/form-data"
                >
                  <div style={{ marginBottom: 16, textAlign: 'center' }}>
                    <Avatar
                      size={100}
                      icon={<UserOutlined />}
                      src={user.avatar}
                      style={{ marginBottom: 16 }}
                    />
                    <Form.Item
                      name="avatarFile"
                      valuePropName="file"
                      getValueFromEvent={(e) => {
                        if (e.file) {
                          setAvatarFile(e.file);
                          return e.file;
                        }
                        return null;
                      }}
                    >
                      <Upload
                        name="avatarFile"
                        listType="picture-circle"
                        beforeUpload={() => false} // 阻止自动上传
                        onChange={(info) => {
                          if (info.file.status === 'removed') {
                            setAvatarFile(null);
                          }
                        }}
                        maxCount={1}
                      >
                        <Button icon={<UploadOutlined />}>更换头像</Button>
                      </Upload>
                    </Form.Item>
                  </div>
                  <Form.Item
                    name="username"
                    rules={[{ required: true, message: '请输入用户名' }]}
                    label="用户名"
                  >
                    <Input placeholder="请输入用户名" />
                  </Form.Item>
                  <Form.Item
                    name="bio"
                    label="个人简介"
                  >
                    <Input.TextArea placeholder="请输入个人简介" rows={3} />
                  </Form.Item>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                    <Button type="primary" icon={<SaveOutlined />} htmlType="submit" loading={saveLoading}>
                      保存
                    </Button>
                    <Button icon={<CloseOutlined />} onClick={handleCancelEdit}>
                      取消
                    </Button>
                  </div>
                </Form>
              ) : (
                <div>
                  <Avatar
                    size={100}
                    icon={<UserOutlined />}
                    src={user.avatar}
                    style={{ marginBottom: 16 }}
                  />
                  <Title level={3} style={{ margin: 0 }}>{user.username}</Title>
                  <Text type="secondary">{user.email}</Text>
                  <Paragraph style={{ margin: '16px 0 24px' }}>{user.bio || '暂无个人简介'}</Paragraph>
                  
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>注册时间：</Text>
                      <Text type="secondary">{new Date(user.created_at).toLocaleDateString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>发帖数：</Text>
                      <Text strong>{user.post_count || 0}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>评论数：</Text>
                      <Text strong>{user.comment_count || 0}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>获赞数：</Text>
                      <Text strong>{user.reputation || 0}</Text>
                    </div>
                  </Space>
                  
                  <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                    <Button type="primary" icon={<EditOutlined />} block onClick={handleEdit}>
                      编辑资料
                    </Button>
                    <Button danger icon={<LogoutOutlined />} block onClick={handleLogout}>
                      退出登录
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </Col>
        
        {/* 右侧内容区域 - 使用选项卡 */}
        <Col xs={24} md={16}>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              {
                key: 'posts',
                label: '我的发帖',
                children: (
                  <Card hoverable>
                    {posts.length > 0 ? (
                      <List
                        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
                        dataSource={posts}
                        renderItem={(post) => (
                          <List.Item
                            actions={[
                              <Space size="middle">
                                <Text type="secondary">
                                  <BookOutlined style={{ marginRight: 4 }} />
                                  {post.likes_count || 0} 点赞
                                </Text>
                                <Text type="secondary">
                                  <CommentOutlined style={{ marginRight: 4 }} />
                                  {post.comment_count || 0} 评论
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
                                      {new Date(post.created_at).toLocaleString()}
                                    </Text>
                                </div>
                              }
                            />
                          </List.Item>
                        )}
                      />
                    ) : (
                      <div style={{ textAlign: 'center', padding: '50px 0' }}>
                        <Text type="secondary">暂无发帖记录</Text>
                        <br />
                        <Link to="/posts/create">
                          <Button
                            type="primary"
                            icon={<BookOutlined />}
                            style={{ marginTop: 16 }}
                          >
                            发布第一条帖子
                          </Button>
                        </Link>
                      </div>
                    )}
                  </Card>
                ),
              },
              {
                key: 'history',
                label: '浏览历史',
                children: (
                  <Card
                    hoverable
                    extra={
                      browsingHistory.length > 0 && (
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleClearHistory}
                        >
                          清空历史
                        </Button>
                      )
                    }
                  >
                    <Spin spinning={historyLoading}>
                      {browsingHistory.length > 0 ? (
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
                          dataSource={browsingHistory}
                          renderItem={(item) => {
                            const post = item.post;
                            return (
                              <List.Item
                                actions={[
                                  <Space size="middle">
                                    <Text type="secondary">
                                      <BookOutlined style={{ marginRight: 4 }} />
                                      {post.likes_count || 0} 点赞
                                    </Text>
                                    <Text type="secondary">
                                      <CommentOutlined style={{ marginRight: 4 }} />
                                      {post.comment_count || 0} 评论
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
                                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          {new Date(post.created_at).toLocaleString()}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          <EyeOutlined style={{ marginRight: 4 }} />
                                          {new Date(item.viewed_at).toLocaleString()}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            );
                          }}
                        />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span>暂无浏览历史记录</span>
                          }
                        />
                      )}
                    </Spin>
                  </Card>
                ),
              },
            ]}
          />
        </Col>
      </Row>
    </div>
  )
}

export default Profile
