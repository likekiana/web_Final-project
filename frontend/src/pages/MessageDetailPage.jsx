import React, { useState, useEffect } from 'react'
import { Card, List, Avatar, Button, Space, Typography, Input, Form, Spin, Upload, Image, Modal, message } from 'antd'
import { SendOutlined, ArrowLeftOutlined, UploadOutlined, VideoCameraOutlined, PictureOutlined } from '@ant-design/icons'
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'
import { messageAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'

const { Title, Text } = Typography
const { TextArea } = Input

const MessageDetailPage = () => {
  const { userId: pathUserId } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [recipientInfo, setRecipientInfo] = useState(null)
  const [form] = Form.useForm()
  const [error, setError] = useState(null)
  // 使用AuthContext获取当前用户信息
  const { user: currentUser } = useAuth()
  // 文件上传状态
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [previewVideo, setPreviewVideo] = useState('')
  // 文件列表
  const [imageFileList, setImageFileList] = useState([])
  const [videoFileList, setVideoFileList] = useState([])

  // 解析查询参数
  const queryParams = new URLSearchParams(location.search)
  const queryUserId = queryParams.get('userId')
  // 优先使用路径参数，如果没有则使用查询参数
  const userId = pathUserId || queryUserId
  // 确保userId是数字类型
  const numericUserId = userId ? parseInt(userId, 10) : null
  // 添加调试日志
  console.log('MessageDetailPage - userId:', userId, 'numericUserId:', numericUserId, 'pathUserId:', pathUserId, 'queryUserId:', queryUserId)

  // 获取与特定用户的对话
  const fetchConversationMessages = async (targetUserId) => {
    setLoading(true)
    setError(null)
    try {
      const response = await messageAPI.getConversationWithUser(targetUserId)
      if (response.success) {
        setMessages(response.data || [])
        // 获取收件人信息
        if (response.data && response.data.length > 0) {
          const firstMessage = response.data[0]
          setRecipientInfo(
            firstMessage.sender?.id === currentUser?.id ? firstMessage.recipient : firstMessage.sender
          )
        }
      }
    } catch (error) {
      console.error('Failed to fetch conversation messages:', error)
      setError('获取对话失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  // 发送私信
  const handleSendMessage = async (values) => {
    try {
      // 准备发送数据
      const messageData = {
        ...values,
        recipient_id: numericUserId // 使用数字类型的用户ID
      }
      
      const response = await messageAPI.sendMessage(messageData)
      
      // 添加调试日志，查看服务器返回的完整响应
      console.log('Message send response:', response)
      
      // 无论response.success是否存在，都重新获取对话消息
      // 因为服务器可能直接返回消息数据而不是包含success字段的对象
      fetchConversationMessages(userId)
      // 重置表单
      form.resetFields()
      // 重置预览
      setPreviewImage('')
      setPreviewVideo('')
      // 重置文件列表
      setImageFileList([])
      setVideoFileList([])
    } catch (error) {
      console.error('Failed to send message:', error)
    }
  }

  // 处理图片上传变化
  const handleImageChange = (info) => {
    const fileList = info.fileList.slice(-1) // 只保留最新的一个文件
    setImageFileList(fileList)
    
    // 将文件设置到表单字段
    form.setFieldValue('image', fileList[0]?.file || fileList[0]?.originFileObj || null)
  }

  // 处理视频上传变化
  const handleVideoChange = (info) => {
    const fileList = info.fileList.slice(-1) // 只保留最新的一个文件
    setVideoFileList(fileList)
    
    // 将文件设置到表单字段
    form.setFieldValue('video', fileList[0]?.file || fileList[0]?.originFileObj || null)
  }

  // 关闭预览
  const handlePreviewClose = () => {
    setPreviewVisible(false)
  }

  // 初始化数据
  useEffect(() => {
    if (userId) {
      fetchConversationMessages(userId)
    } else {
      setLoading(false)
      setError('请选择一个对话')
    }
  }, [userId])

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
        <Button 
          type="text" 
          icon={<ArrowLeftOutlined />} 
          onClick={() => navigate('/messages')}
          style={{ marginRight: 16 }}
        >
          返回私信列表
        </Button>
        <Title level={2} style={{ margin: 0 }}>
          与 {recipientInfo?.username} 的对话
        </Title>
      </div>

      <Card>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Spin size="large" />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '100px 0' }}>
            <Text type="error" style={{ fontSize: 16 }}>{error}</Text>
            <div style={{ marginTop: 20 }}>
              <Button type="primary" onClick={() => navigate('/messages')}>返回私信列表</Button>
            </div>
          </div>
        ) : (
          <>
            {messages.length > 0 ? (
              <div style={{ maxHeight: 500, overflowY: 'auto', marginBottom: 20, padding: '10px 0' }}>
                {messages.map((msg) => {
                  // 直接使用AuthContext中的currentUser
                  const isCurrentUser = msg.sender?.id === currentUser?.id;
                  return (
                    <div 
                      key={msg.id}
                      style={{
                        marginBottom: 16,
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: isCurrentUser ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {/* 对方的头像 - 左侧 */}
                      {!isCurrentUser && (
                        <Avatar 
                          src={msg.sender?.avatar || ''} 
                          alt={msg.sender?.username}
                          style={{ 
                            marginRight: 10, 
                            width: 40, 
                            height: 40, 
                            fontSize: 18 
                          }}
                        >
                          {msg.sender?.username?.charAt(0) || '用'}
                        </Avatar>
                      )}
                      
                      {/* 消息内容 */}
                      <div
                        style={{
                          maxWidth: '70%',
                          padding: 12,
                          borderRadius: isCurrentUser ? '18px 2px 18px 18px' : '2px 18px 18px 18px',
                          backgroundColor: isCurrentUser ? '#1890ff' : '#f0f0f0',
                          color: isCurrentUser ? '#fff' : '#000',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                          position: 'relative'
                        }}
                      >
                        {/* 只有对方的消息显示发送者名称 */}
                        {!isCurrentUser && (
                          <div style={{ marginBottom: 4, fontSize: 12, fontWeight: 'bold', opacity: 0.8 }}>
                            {msg.sender?.username || '系统'}
                          </div>
                        )}
                        
                        {/* 文字内容 */}
                        {msg.content && <div style={{ lineHeight: 1.5, marginBottom: msg.image || msg.video ? 8 : 0 }}>{msg.content}</div>}
                        
                        {/* 图片显示 */}
                        {msg.image && (
                          <div style={{ marginBottom: msg.video ? 8 : 0 }}>
                            <Image 
                              src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000'}${msg.image}`} 
                              alt="消息图片"
                              style={{ maxWidth: '100%', borderRadius: 8, cursor: 'pointer' }}
                              onClick={() => {
                                setPreviewImage(`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000'}${msg.image}`)
                                setPreviewVideo('')
                                setPreviewVisible(true)
                              }}
                            />
                          </div>
                        )}
                        
                        {/* 视频显示 */}
                        {msg.video && (
                          <div>
                            <video 
                              src={`${import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:8000'}${msg.video}`} 
                              controls 
                              style={{ maxWidth: '100%', borderRadius: 8 }}
                            />
                          </div>
                        )}
                        
                        <div style={{ 
                          marginTop: 4, 
                          fontSize: 10, 
                          opacity: 0.7, 
                          textAlign: 'right' 
                        }}>
                          {new Date(msg.created_at).toLocaleTimeString('zh-CN', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </div>
                      </div>
                      
                      {/* 当前用户的头像 - 右侧 */}
                      {isCurrentUser && (
                        <Avatar 
                          src={currentUser?.avatar || ''} 
                          alt="我"
                          style={{ 
                            marginLeft: 10, 
                            width: 40, 
                            height: 40, 
                            fontSize: 18 
                          }}
                        >
                          {currentUser?.username?.charAt(0) || '我'}
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '50px 0' }}>
                <Text type="secondary">暂无消息</Text>
              </div>
            )}
        
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSendMessage}
              style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}
            >
              <Form.Item
                name="content"
                rules={[{ required: false, message: '请输入消息内容' }]}
              >
                <TextArea
                  rows={3}
                  placeholder="请输入消息内容"
                  style={{
                    borderRadius: 20,
                    resize: 'none',
                    borderColor: '#d9d9d9'
                  }}
                />
              </Form.Item>
              
              {/* 文件上传区域 */}
              <Form.Item>
                <Space>
                  {/* 图片上传 */}
                  <Form.Item
                    name="image"
                    valuePropName="file"
                    getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj || null}
                    noStyle
                  >
                    <Upload
                      accept="image/*"
                      showUploadList={true}
                      fileList={imageFileList}
                      onChange={handleImageChange}
                      beforeUpload={(file) => {
                        // 验证文件大小
                        const isLt10M = file.size / 1024 / 1024 < 10;
                        if (!isLt10M) {
                          message.error('文件大小不能超过10MB');
                          return Upload.LIST_IGNORE;
                        }
                        // 验证文件类型
                        if (!file.type.startsWith('image/')) {
                          message.error('只允许上传图片文件');
                          return Upload.LIST_IGNORE;
                        }
                        // 生成预览URL
                        const previewUrl = URL.createObjectURL(file);
                        // 添加到图片列表
                        setImageFileList([{
                          uid: Date.now(),
                          name: file.name,
                          status: 'ready',
                          url: previewUrl,
                          file: file
                        }]);
                        // 阻止自动上传
                        return false;
                      }}
                      onRemove={() => {
                        setImageFileList([]);
                        form.setFieldValue('image', null);
                        return true;
                      }}
                    >
                      <Button icon={<PictureOutlined />}>
                        上传图片
                      </Button>
                    </Upload>
                  </Form.Item>
                  
                  {/* 视频上传 */}
                  <Form.Item
                    name="video"
                    valuePropName="file"
                    getValueFromEvent={(e) => e?.fileList?.[0]?.originFileObj || null}
                    noStyle
                  >
                    <Upload
                      accept="video/*"
                      showUploadList={true}
                      fileList={videoFileList}
                      onChange={handleVideoChange}
                      beforeUpload={(file) => {
                        // 验证文件大小
                        const isLt50M = file.size / 1024 / 1024 < 50;
                        if (!isLt50M) {
                          message.error('视频大小不能超过50MB');
                          return Upload.LIST_IGNORE;
                        }
                        // 验证文件类型
                        if (!file.type.startsWith('video/')) {
                          message.error('只允许上传视频文件');
                          return Upload.LIST_IGNORE;
                        }
                        // 生成预览URL
                        const previewUrl = URL.createObjectURL(file);
                        // 添加到视频列表
                        setVideoFileList([{
                          uid: Date.now(),
                          name: file.name,
                          status: 'ready',
                          url: previewUrl,
                          file: file
                        }]);
                        // 阻止自动上传
                        return false;
                      }}
                      onRemove={() => {
                        setVideoFileList([]);
                        form.setFieldValue('video', null);
                        return true;
                      }}
                    >
                      <Button icon={<VideoCameraOutlined />}>
                        上传视频
                      </Button>
                    </Upload>
                  </Form.Item>
                </Space>
              </Form.Item>
              
              <Form.Item style={{ textAlign: 'right', marginBottom: 0 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SendOutlined />}
                  style={{
                    borderRadius: 20,
                    padding: '8px 20px'
                  }}
                >
                  发送
                </Button>
              </Form.Item>
            </Form>
            
            {/* 媒体预览模态框 */}
            <Modal
              open={previewVisible}
              footer={null}
              onCancel={handlePreviewClose}
              width={800}
            >
              {previewImage && (
                <Image
                  alt="预览"
                  src={previewImage}
                  style={{ width: '100%' }}
                />
              )}
              {previewVideo && (
                <video
                  src={previewVideo}
                  controls
                  style={{ width: '100%' }}
                />
              )}
            </Modal>
          </>
        )}
      </Card>
    </div>
  )
}

export default MessageDetailPage