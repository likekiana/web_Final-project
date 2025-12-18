import React, { useState, useEffect } from 'react'
import { Card, Typography, Button, Avatar, Space, Tag, Spin, Modal, Select, message, Popover, Drawer } from 'antd'
import { ArrowLeftOutlined, LikeOutlined, CommentOutlined, EyeOutlined, UserOutlined, ExclamationCircleOutlined, HeartOutlined, ShareAltOutlined, CopyOutlined, WechatOutlined, WeiboOutlined, QqOutlined, MessageOutlined, SendOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'

// 导入API服务
import { postAPI, reportAPI, favoriteAPI, followAPI, userAPI, messageAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography

const PostDetail = ({ postId }) => {
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const navigate = useNavigate()
  
  // 举报相关状态
  const [reportModalVisible, setReportModalVisible] = useState(false)
  const [reportType, setReportType] = useState('')
  const [reportReason, setReportReason] = useState('')
  const [reporting, setReporting] = useState(false)
  
  // 收藏相关状态
  const [isFavorited, setIsFavorited] = useState(false)
  const [favoriting, setFavoriting] = useState(false)
  const [following, setFollowing] = useState(false)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [liking, setLiking] = useState(false)
  
  // 用户信息模态框状态
  const [userProfileVisible, setUserProfileVisible] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [userProfileLoading, setUserProfileLoading] = useState(false)
  
  // 私信功能状态
  const [messageDrawerVisible, setMessageDrawerVisible] = useState(false)
  const [messageContent, setMessageContent] = useState('')
  const [sendingMessage, setSendingMessage] = useState(false)

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

  // 检查帖子是否已被收藏
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (!postId || !localStorage.getItem('token')) return
      
      try {
        const response = await favoriteAPI.checkFavorite(postId)
        if (response.success) {
          setIsFavorited(response.data.is_favorited)
        }
      } catch (err) {
        console.error('Failed to check favorite status:', err)
      }
    }

    checkFavoriteStatus()
  }, [postId])

  // 检查是否已关注帖子作者
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!post || !post.user || !localStorage.getItem('token')) return
      
      try {
        const response = await followAPI.checkFollow(post.user.id)
        if (response.success) {
          setIsFollowing(response.data.is_following)
        }
      } catch (err) {
        console.error('Failed to check follow status:', err)
      }
    }

    checkFollowStatus()
  }, [post])

  // 处理关注/取消关注帖子作者
  const handleToggleFollow = async () => {
    if (!post || !post.user) {
      message.error('无法获取用户信息')
      return
    }
    
    if (!localStorage.getItem('token')) {
      message.error('请先登录')
      return
    }
    
    // 获取当前登录用户信息
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    // 检查是否是自己的帖子，不能关注自己
    if (currentUser.id && post.user.id === currentUser.id) {
      message.info('不能关注自己')
      return
    }
    
    setFollowing(true)
    try {
      const response = await followAPI.toggleFollow(post.user.id)
      if (response.success) {
        setIsFollowing(response.data.is_following)
        message.success(response.data.is_following ? '关注成功' : '取消关注成功')
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err)
      message.error(err.response?.data?.message || '操作失败，请重试')
    } finally {
      setFollowing(false)
    }
  }

  // 处理收藏/取消收藏
  const handleToggleFavorite = async () => {
    if (!localStorage.getItem('token')) {
      message.error('请先登录')
      return
    }
    
    setFavoriting(true)
    try {
      const response = await favoriteAPI.toggleFavorite(postId)
      if (response.success) {
        setIsFavorited(response.data.is_favorited)
        message.success(response.data.is_favorited ? '收藏成功' : '取消收藏成功')
      }
    } catch (err) {
      console.error('Failed to toggle favorite:', err)
      message.error('操作失败，请重试')
    } finally {
      setFavoriting(false)
    }
  }
  
  // 处理点赞/取消点赞
  const handleToggleLike = async () => {
    if (!localStorage.getItem('token')) {
      message.error('请先登录')
      return
    }
    
    setLiking(true)
    try {
      const response = await postAPI.likePost(postId)
      if (response.success) {
        setIsLiked(response.data.isLiked)
        // 更新帖子点赞数
        setPost(prevPost => ({
          ...prevPost,
          likes_count: response.data.likesCount
        }))
        message.success(response.data.isLiked ? '点赞成功' : '取消点赞成功')
      }
    } catch (err) {
      console.error('Failed to toggle like:', err)
      message.error('操作失败，请重试')
    } finally {
      setLiking(false)
    }
  }
  
  // 获取用户信息
  const fetchUserProfile = async (userId) => {
    setUserProfileLoading(true)
    try {
      const response = await userAPI.getUserInfo(userId)
      if (response.success) {
        setUserProfile(response.data)
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err)
      message.error('获取用户信息失败')
    } finally {
      setUserProfileLoading(false)
    }
  }
  
  // 打开用户信息模态框
  const handleOpenUserProfile = () => {
    if (post.type === 'anonymous') {
      message.info('匿名用户信息不可查看')
      return
    }
    
    if (post.user) {
      fetchUserProfile(post.user.id)
      setUserProfileVisible(true)
    }
  }
  
  // 关闭用户信息模态框
  const handleCloseUserProfile = () => {
    setUserProfileVisible(false)
  }
  
  // 打开发送私信抽屉
  const handleOpenMessageDrawer = () => {
    if (!localStorage.getItem('token')) {
      message.error('请先登录')
      return
    }
    
    // 获取当前登录用户信息
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    // 检查是否是自己，不能给自己发送私信
    if (currentUser.id && post.user && post.user.id === currentUser.id) {
      message.info('不能给自己发送私信')
      return
    }
    
    setMessageDrawerVisible(true)
  }
  
  // 关闭发送私信抽屉
  const handleCloseMessageDrawer = () => {
    setMessageDrawerVisible(false)
    setMessageContent('')
  }
  
  // 发送私信
  const handleSendMessage = async () => {
    if (!messageContent.trim()) {
      message.error('请输入私信内容')
      return
    }
    
    if (!post.user) {
      message.error('无法获取用户信息')
      return
    }
    
    // 获取当前登录用户信息
    const currentUser = JSON.parse(localStorage.getItem('userInfo') || '{}')
    
    // 检查是否是自己，不能给自己发送私信
    if (currentUser.id && post.user.id === currentUser.id) {
      message.info('不能给自己发送私信')
      return
    }
    
    setSendingMessage(true)
    try {
      const response = await messageAPI.sendMessage({
        recipient_id: post.user.id,
        content: messageContent
      })
      if (response.success) {
        message.success('私信发送成功')
        setMessageDrawerVisible(false)
        setMessageContent('')
      }
    } catch (err) {
      console.error('Failed to send message:', err)
      message.error(err.response?.data?.message || '私信发送失败，请重试')
    } finally {
      setSendingMessage(false)
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
    <>
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
          {post.is_sticky && <Tag color="red">置顶</Tag>}
          {post.is_essential && <Tag color="purple">精华</Tag>}
          {post.type === 'trade' && <Tag color="orange">交易</Tag>}
          {post.type === 'advertisement' && <Tag color="red">广告</Tag>}
          {post.type === 'anonymous' && <Tag color="gray">匿名</Tag>}
        </Space>

        {/* 帖子内容 */}
        <Paragraph style={{ margin: '24px 0' }}>
          {post.content}
        </Paragraph>

        {/* 帖子媒体文件 */}
        {post.media_files && post.media_files.length > 0 && (
          <div style={{ margin: '24px 0', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
            {post.media_files.map((file, index) => (
              <div key={index} style={{ flex: '1 1 300px', maxWidth: '400px' }}>
                {file.endsWith('.mp4') || file.endsWith('.mov') || file.endsWith('.avi') ? (
                  <video src={file} controls style={{ width: '100%', borderRadius: 8 }} />
                ) : (
                  <img src={file} alt={`媒体文件 ${index + 1}`} style={{ width: '100%', borderRadius: 8 }} />
                )}
              </div>
            ))}
          </div>
        )}

        {/* 帖子作者信息和统计 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
          <Space>
            <Avatar 
              icon={<UserOutlined />} 
              src={post.type === 'anonymous' ? null : post.user?.avatar} 
              size={40} 
              style={{ cursor: post.type !== 'anonymous' ? 'pointer' : 'default' }}
              onClick={handleOpenUserProfile}
            />
            <div>
              <Text strong>{post.type === 'anonymous' ? '匿名用户' : post.user?.username}</Text>
              <br />
              <Text type="secondary" style={{ fontSize: 12 }}>
                {new Date(post.created_at).toLocaleString()}
              </Text>
              {post.type !== 'anonymous' && (
                <>
                  <br />
                  <Space size="small" style={{ marginTop: 8 }}>
                    <Button 
                      type={isFollowing ? "primary" : "default"} 
                      size="small"
                      loading={following}
                      onClick={handleToggleFollow}
                    >
                      {isFollowing ? '已关注' : '关注'}
                    </Button>
                    <Button 
                      type="primary" 
                      icon={<MessageOutlined />}
                      size="small"
                      onClick={handleOpenMessageDrawer}
                    >
                      私信
                    </Button>
                  </Space>
                </>
              )}
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
            <Button
              type={isLiked ? "primary" : "default"}
              icon={<LikeOutlined />}
              size="small"
              loading={liking}
              onClick={handleToggleLike}
              style={{ padding: '0 12px' }}
            >
              {post.likes_count || 0}
            </Button>
            <Button 
              type={isFavorited ? "primary" : "default"} 
              icon={<HeartOutlined />}
              size="small"
              loading={favoriting}
              onClick={handleToggleFavorite}
            >
              {isFavorited ? '已收藏' : '收藏'}
            </Button>
            
            {/* 分享功能 */}
            <Popover
              content={(
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Button 
                    icon={<WechatOutlined />} 
                    type="default"
                    block
                    onClick={() => {
                      message.info('微信分享功能请在手机端浏览器中使用');
                    }}
                  >
                    微信
                  </Button>
                  <Button 
                    icon={<WeiboOutlined />} 
                    type="default"
                    block
                    onClick={() => {
                      const shareUrl = encodeURIComponent(window.location.href);
                      const shareTitle = encodeURIComponent(post.title);
                      const weiboUrl = `http://service.weibo.com/share/share.php?url=${shareUrl}&title=${shareTitle}`;
                      window.open(weiboUrl, '_blank', 'width=600,height=400');
                    }}
                  >
                    微博
                  </Button>
                  <Button 
                    icon={<QqOutlined />} 
                    type="default"
                    block
                    onClick={() => {
                      const shareUrl = encodeURIComponent(window.location.href);
                      const shareTitle = encodeURIComponent(post.title);
                      const qqUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${shareUrl}&title=${shareTitle}`;
                      window.open(qqUrl, '_blank', 'width=600,height=400');
                    }}
                  >
                    QQ
                  </Button>
                  <Button 
                    icon={<CopyOutlined />} 
                    type="default"
                    block
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                        .then(() => {
                          message.success('链接已复制到剪贴板');
                        })
                        .catch(() => {
                          message.error('复制失败，请手动复制');
                        });
                    }}
                  >
                    复制链接
                  </Button>
                </Space>
              )}
              title="分享到"
              trigger="click"
            >
              <Button 
                type="default" 
                icon={<ShareAltOutlined />}
                size="small"
              >
                分享
              </Button>
            </Popover>
            
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
      
      {/* 用户信息模态框 */}
      <Modal
        title="用户信息"
        open={userProfileVisible}
        onCancel={handleCloseUserProfile}
        footer={null}
        width={500}
      >
        <Spin spinning={userProfileLoading}>
          {userProfile && (
            <div style={{ padding: '20px 0' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                <Avatar 
                  icon={<UserOutlined />} 
                  src={userProfile.avatar} 
                  size={100} 
                  style={{ marginBottom: '16px' }}
                />
                <Title level={3} style={{ margin: 0 }}>{userProfile.username}</Title>
                <Text type="secondary">{userProfile.role || '学生'}</Text>
              </div>
              
              <div style={{ marginBottom: '16px' }}>
                <Text strong style={{ marginBottom: '8px', display: 'block' }}>个人简介</Text>
                <p style={{ margin: 0, color: '#595959', lineHeight: '1.6' }}>
                  {userProfile.bio || '暂无简介'}
                </p>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '24px' }}>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>{userProfile.post_count || 0}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>发帖数</Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>{userProfile.comment_count || 0}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>评论数</Text>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <Text strong style={{ fontSize: '20px', color: '#1890ff' }}>{userProfile.reputation || 0}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '14px' }}>声望值</Text>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
                <Button 
                  type={isFollowing ? "primary" : "default"} 
                  size="middle"
                  loading={following}
                  onClick={handleToggleFollow}
                >
                  {isFollowing ? '已关注' : '关注'}
                </Button>
                <Button 
                  type="primary" 
                  icon={<MessageOutlined />}
                  size="middle"
                  onClick={() => {
                    handleCloseUserProfile();
                    handleOpenMessageDrawer();
                  }}
                >
                  私信
                </Button>
              </div>
            </div>
          )}
        </Spin>
      </Modal>
      
      {/* 发送私信抽屉 */}
      <Drawer
        title={`发送私信给 ${post.user?.username || '用户'}`}
        placement="right"
        onClose={handleCloseMessageDrawer}
        open={messageDrawerVisible}
        width={400}
      >
        <div style={{ padding: '20px 0' }}>
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>收件人</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar 
                icon={<UserOutlined />} 
                src={post.user?.avatar} 
                size={40} 
              />
              <div>
                <Text strong>{post.user?.username || '未知用户'}</Text>
              </div>
            </div>
          </div>
          
          <div style={{ marginBottom: '20px' }}>
            <Text strong style={{ marginBottom: '8px', display: 'block' }}>私信内容</Text>
            <textarea
              style={{ 
                width: '100%', 
                height: 200, 
                padding: 12, 
                border: '1px solid #d9d9d9',
                borderRadius: 8,
                resize: 'vertical',
                fontSize: '14px',
                lineHeight: '1.6'
              }}
              placeholder="请输入私信内容..."
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
            />
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
            <Button 
              onClick={handleCloseMessageDrawer}
            >
              取消
            </Button>
            <Button 
              type="primary" 
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              loading={sendingMessage}
              disabled={sendingMessage}
            >
              发送
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}

export default PostDetail