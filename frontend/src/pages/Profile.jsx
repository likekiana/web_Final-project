import React, { useState, useEffect } from 'react'
import { Card, Typography, Row, Col, Button, List, Avatar, Space, Spin, message, Form, Input, Upload, Tabs, Empty, Modal } from 'antd'
import { EditOutlined, LogoutOutlined, BookOutlined, UserOutlined, CommentOutlined, SaveOutlined, CloseOutlined, UploadOutlined, EyeOutlined, DeleteOutlined, StarOutlined } from '@ant-design/icons'
import { useNavigate, Link } from 'react-router-dom'
import { authAPI, userAPI, historyAPI, favoriteAPI, followAPI, postAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography

const Profile = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [posts, setPosts] = useState([])
  const [browsingHistory, setBrowsingHistory] = useState([])
  const [favorites, setFavorites] = useState([])
  const [following, setFollowing] = useState([])
  const [followers, setFollowers] = useState([])
  const [loading, setLoading] = useState(true)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [favoritesLoading, setFavoritesLoading] = useState(false)
  const [followingLoading, setFollowingLoading] = useState(false)
  const [followersLoading, setFollowersLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [form] = Form.useForm()
  const [saveLoading, setSaveLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('posts')
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [deleteModalVisible, setDeleteModalVisible] = useState(false)
  const [postToDelete, setPostToDelete] = useState(null)

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

  // 获取收藏夹列表
  const fetchFavorites = async () => {
    setFavoritesLoading(true)
    try {
      const response = await favoriteAPI.getFavorites()
      let favoritesData = []
      
      // 处理不同的响应格式
      if (response.success) {
        // 自定义响应格式，带success字段
        if (response.data?.results) {
          // 分页响应
          favoritesData = response.data.results
        } else if (Array.isArray(response.data)) {
          // 直接返回数组
          favoritesData = response.data
        } else {
          // 其他格式
          favoritesData = response.data || []
        }
      } else if (response.results) {
        // DRF标准分页响应（没有success字段）
        favoritesData = response.results
      } else if (Array.isArray(response)) {
        // 直接返回数组
        favoritesData = response
      }
      
      setFavorites(favoritesData)
    } catch (error) {
      console.error('Failed to fetch favorites:', error)
      message.error('获取收藏夹失败')
    } finally {
      setFavoritesLoading(false)
    }
  }

  // 获取关注列表
  const fetchFollowing = async () => {
    setFollowingLoading(true)
    try {
      const response = await followAPI.getFollowing()
      let followingData = []
      
      // 处理不同的响应格式
      if (response.success) {
        // 非分页响应，直接返回带有success字段的对象
        if (Array.isArray(response.data)) {
          // response.data是直接的关注列表数组
          followingData = response.data
        } else if (response.data?.data) {
          // 特殊情况：response.data包含另一个data字段
          followingData = response.data.data
        } else {
          followingData = []
        }
      } else if (response.results) {
        // 分页响应
        if (response.results.success && response.results.data) {
          // 分页响应中results字段包含带有success和data字段的对象
          followingData = response.results.data
        } else {
          // DRF标准分页响应，results直接是数组
          followingData = response.results
        }
      } else {
        // 其他情况
        followingData = []
      }
      
      setFollowing(followingData)
    } catch (error) {
      console.error('Failed to fetch following list:', error)
      message.error('获取关注列表失败')
    } finally {
      setFollowingLoading(false)
    }
  }

  // 获取粉丝列表
  const fetchFollowers = async () => {
    setFollowersLoading(true)
    try {
      const response = await followAPI.getFollowers()
      let followersData = []
      
      // 处理不同的响应格式
      if (response.success) {
        // 非分页响应，直接返回带有success字段的对象
        if (Array.isArray(response.data)) {
          // response.data是直接的粉丝列表数组
          followersData = response.data
        } else if (response.data?.data) {
          // 特殊情况：response.data包含另一个data字段
          followersData = response.data.data
        } else {
          followersData = []
        }
      } else if (response.results) {
        // 分页响应
        if (response.results.success && response.results.data) {
          // 分页响应中results字段包含带有success和data字段的对象
          followersData = response.results.data
        } else {
          // DRF标准分页响应，results直接是数组
          followersData = response.results
        }
      } else {
        // 其他情况
        followersData = []
      }
      
      setFollowers(followersData)
    } catch (error) {
      console.error('Failed to fetch followers list:', error)
      message.error('获取粉丝列表失败')
    } finally {
      setFollowersLoading(false)
    }
  }

  // 关注/取消关注用户
  const handleToggleFollow = async (userId) => {
    try {
      const response = await followAPI.toggleFollow(userId)
      if (response.success || response.status === 'following' || response.status === 'unfollowed') {
        // 无论当前在哪个选项卡，都更新关注列表和粉丝列表
        // 这样下次切换到对应选项卡时就能看到最新数据
        fetchFollowing()
        fetchFollowers()
        message.success(response.message || (response.data?.is_following ? '关注成功' : '取消关注成功'))
      }
    } catch (error) {
      console.error('Failed to toggle follow:', error)
      message.error('操作失败，请重试')
    }
  }

  // 当选项卡切换时获取对应数据
  useEffect(() => {
    if (activeTab === 'history') {
      fetchBrowsingHistory()
    } else if (activeTab === 'favorites') {
      fetchFavorites()
    } else if (activeTab === 'following') {
      fetchFollowing()
    } else if (activeTab === 'followers') {
      fetchFollowers()
    }
  }, [activeTab])

  // 打开删除确认对话框
  const handleDeletePost = (post) => {
    setPostToDelete(post)
    setDeleteModalVisible(true)
  }

  // 关闭删除确认对话框
  const handleCancelDelete = () => {
    setDeleteModalVisible(false)
    setPostToDelete(null)
  }

  // 执行删除帖子操作
  const handleConfirmDeletePost = async () => {
    if (!postToDelete) return
    
    try {
      const response = await postAPI.deletePost(postToDelete.id)
      if (response.success) {
        message.success('帖子删除成功')
        // 更新帖子列表
        setPosts(posts.filter(post => post.id !== postToDelete.id))
        // 关闭对话框
        handleCancelDelete()
      } else {
        message.error(response.message || '帖子删除失败')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
      message.error('帖子删除失败')
    }
  }



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
                      <Text type="secondary">{new Date(user.createdAt).toLocaleDateString()}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>发帖数：</Text>
                      <Text strong>{user.postCount || 0}</Text>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Text>评论数：</Text>
                      <Text strong>{user.commentCount || 0}</Text>
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
                                  <Button
                                    type="link"
                                    danger
                                    icon={<DeleteOutlined />}
                                    size="small"
                                    onClick={() => handleDeletePost(post)}
                                  >
                                    删除
                                  </Button>
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
              {
                key: 'favorites',
                label: '我的收藏',
                children: (
                  <Card hoverable>
                    <Spin spinning={favoritesLoading}>
                      {favorites.length > 0 ? (
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
                          dataSource={favorites}
                          renderItem={(favorite) => {
                            const post = favorite.post;
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
                                          <StarOutlined style={{ marginRight: 4, color: '#ffd700' }} />
                                          {new Date(favorite.created_at).toLocaleString()}
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
                            <span>暂无收藏记录</span>
                          }
                        />
                      )}
                    </Spin>
                  </Card>
                ),
              },
              {
                key: 'following',
                label: '我的关注',
                children: (
                  <Card hoverable>
                    <Spin spinning={followingLoading}>
                      {following.length > 0 ? (
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
                          dataSource={following}
                          renderItem={(item) => {
                            // 处理不同的数据结构
                            const userData = item.following || item.user || item
                            return (
                              <List.Item
                                actions={[
                                  <Space size="middle">
                                    <Button
                                      type={item.is_following ? 'default' : 'primary'}
                                      size="small"
                                      onClick={() => handleToggleFollow(userData.id)}
                                    >
                                      {item.is_following ? '取消关注' : '关注'}
                                    </Button>
                                  </Space>
                                ]}
                                style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<UserOutlined />} src={userData.avatar} />}
                                  title={
                                    <Link to={`/users/${userData.id}`}>{userData.username}</Link>
                                  }
                                  description={
                                    <div>
                                      <Paragraph ellipsis={{ rows: 1 }}>{userData.bio || '暂无个人简介'}</Paragraph>
                                      <div style={{ display: 'flex', gap: 16 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          发帖数: {userData.postCount || 0}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          获赞数: {userData.reputation || 0}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )
                          }}
                        />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span>暂无关注记录</span>
                          }
                        />
                      )}
                    </Spin>
                  </Card>
                ),
              },
              {
                key: 'followers',
                label: '我的粉丝',
                children: (
                  <Card hoverable>
                    <Spin spinning={followersLoading}>
                      {followers.length > 0 ? (
                        <List
                          grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
                          dataSource={followers}
                          renderItem={(item) => {
                            // 处理不同的数据结构
                            const userData = item.follower || item.user || item
                            return (
                              <List.Item
                                actions={[
                                  <Space size="middle">
                                    <Button
                                      type={item.is_following ? 'default' : 'primary'}
                                      size="small"
                                      onClick={() => handleToggleFollow(userData.id)}
                                    >
                                      {item.is_following ? '取消关注' : '关注'}
                                    </Button>
                                  </Space>
                                ]}
                                style={{ marginBottom: 16, padding: 16, border: '1px solid #f0f0f0', borderRadius: 8 }}
                              >
                                <List.Item.Meta
                                  avatar={<Avatar icon={<UserOutlined />} src={userData.avatar} />}
                                  title={
                                    <Link to={`/users/${userData.id}`}>{userData.username}</Link>
                                  }
                                  description={
                                    <div>
                                      <Paragraph ellipsis={{ rows: 1 }}>{userData.bio || '暂无个人简介'}</Paragraph>
                                      <div style={{ display: 'flex', gap: 16 }}>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          发帖数: {userData.postCount || 0}
                                        </Text>
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                          获赞数: {userData.reputation || 0}
                                        </Text>
                                      </div>
                                    </div>
                                  }
                                />
                              </List.Item>
                            )
                          }}
                        />
                      ) : (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={
                            <span>暂无粉丝记录</span>
                          }
                        />
                      )}
                    </Spin>
                  </Card>
                ),
              },
              {
                key: 'settings',
                label: '账号设置',
                children: (
                  <Card hoverable>
                    <div style={{ textAlign: 'center', padding: '50px 0' }}>
                      <Text type="secondary" style={{ fontSize: 16, marginBottom: 24, display: 'block' }}>
                        进入账号设置中心管理您的账号信息和隐私设置
                      </Text>
                      <Link to="/settings">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          size="large"
                        >
                          前往设置中心
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ),
              },
            ]}
          />
        </Col>
      </Row>

      {/* 删除帖子确认对话框 */}
      <Modal
        title="删除帖子"
        open={deleteModalVisible}
        onOk={handleConfirmDeletePost}
        onCancel={handleCancelDelete}
        okText="确认删除"
        cancelText="取消"
        okType="danger"
      >
        <p>确定要删除帖子 "{postToDelete?.title || ''}" 吗？删除后将无法恢复。</p>
      </Modal>
    </div>
  )
}

export default Profile
