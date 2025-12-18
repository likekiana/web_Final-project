import React, { useState, useEffect } from 'react'
import { Card, Typography, Tabs, Form, Input, Button, message, Switch, Space, Spin, Modal } from 'antd'
import { UserOutlined, LockOutlined, KeyOutlined, BellOutlined, SaveOutlined, CloseOutlined, LogoutOutlined, MessageOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import { authAPI, userAPI } from '../services/api'
import Feedback from '../components/Feedback'

const { Title, Text } = Typography

const Settings = () => {
  const [activeTab, setActiveTab] = useState('account')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form] = Form.useForm()
  const [passwordForm] = Form.useForm()
  const [privacyForm] = Form.useForm()

  const [saving, setSaving] = useState(false)
  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false)
  const navigate = useNavigate()

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
            email: response.data.email,
            bio: response.data.bio || ''
          })
          
          // 设置隐私设置表单的初始值
          privacyForm.setFieldsValue({
            showProfile: response.data.showProfile !== undefined ? response.data.showProfile : true,
            allowMessages: response.data.allowMessages !== undefined ? response.data.allowMessages : true,
            allowFollow: response.data.allowFollow !== undefined ? response.data.allowFollow : true,
            showPosts: response.data.showPosts !== undefined ? response.data.showPosts : true,
            saveHistory: response.data.saveHistory !== undefined ? response.data.saveHistory : true
          })
        } else {
          message.error('获取用户信息失败')
          navigate('/login')
        }
      } catch (error) {
        console.error('Failed to fetch current user:', error)
        message.error('获取用户信息失败，请重新登录')
        navigate('/login')
      } finally {
        setLoading(false)
      }
    }

    fetchCurrentUser()
  }, [navigate])

  const handleTabChange = (key) => {
    setActiveTab(key)
  }

  // 保存账号信息
  const handleSaveAccount = async (values) => {
    if (!user) return
    
    setSaving(true)
    try {
      const response = await userAPI.updateUserInfo(user.id, values)
      if (response.success) {
        setUser(response.data)
        message.success('账号信息更新成功')
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('Failed to update account info:', error)
      message.error('更新失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 修改密码
  const handleChangePassword = async (values) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致')
      return
    }
    
    setSaving(true)
    try {
      const response = await authAPI.changePassword({
        old_password: values.oldPassword,
        new_password: values.newPassword
      })
      if (response.success) {
        message.success('密码修改成功')
        passwordForm.resetFields()
      } else {
        message.error(response.message || '密码修改失败')
      }
    } catch (error) {
      console.error('Failed to change password:', error)
      message.error(error.response?.data?.message || '密码修改失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  // 保存隐私设置
  const handleSavePrivacy = async (values) => {
    setSaving(true)
    try {
      // 调用API保存隐私设置
      const privacyData = {
        showProfile: values.showProfile,
        allowMessages: values.allowMessages,
        allowFollow: values.allowFollow,
        showPosts: values.showPosts,
        saveHistory: values.saveHistory
      }
      
      const response = await userAPI.updateUserInfo(user.id, privacyData)
      if (response.success) {
        // 更新本地用户状态
        setUser(prev => ({
          ...prev,
          ...privacyData
        }))
        message.success('隐私设置保存成功')
      } else {
        message.error(response.message || '保存失败')
      }
    } catch (error) {
      console.error('Failed to save privacy settings:', error)
      message.error('保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }


  
  // 处理退出登录
  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userRole')
    message.success('退出登录成功')
    navigate('/login')
  }
  
  // 处理反馈按钮点击
  const handleFeedbackClick = () => {
    setFeedbackModalVisible(true)
  }
  
  // 处理反馈模态框关闭
  const handleFeedbackModalClose = () => {
    setFeedbackModalVisible(false)
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px 0' }}>
        <Spin size="large" />
        <p style={{ marginTop: 16 }}>加载中...</p>
      </div>
    )
  }

  // 定义Tabs的items配置
  const items = [
    {
      key: 'account',
      label: (
        <span>
          <UserOutlined />
          账号管理
        </span>
      ),
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form
            form={form}
            layout="vertical"
            onFinish={handleSaveAccount}
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: '请输入用户名' },
                { min: 3, max: 20, message: '用户名长度必须在3到20个字符之间' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入用户名" />
            </Form.Item>
            
            <Form.Item
              name="email"
              label="邮箱"
              rules={[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="请输入邮箱" />
            </Form.Item>
            
            <Form.Item
              name="bio"
              label="个人简介"
              rules={[
                { max: 200, message: '个人简介长度不能超过200个字符' }
              ]}
            >
              <Input.TextArea 
                placeholder="请输入个人简介" 
                rows={4}
              />
            </Form.Item>
            
            <Form.Item>
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  loading={saving}
                >
                  保存
                </Button>
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={() => form.resetFields()}
                >
                  取消
                </Button>
                <Button 
                  danger 
                  icon={<LogoutOutlined />} 
                  onClick={handleLogout}
                >
                  退出登录
                </Button>
                <Button 
                  icon={<MessageOutlined />} 
                  onClick={handleFeedbackClick}
                >
                  反馈
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )
    },
    {
      key: 'password',
      label: (
        <span>
          <LockOutlined />
          密码管理
        </span>
      ),
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form
            form={passwordForm}
            layout="vertical"
            onFinish={handleChangePassword}
          >
            <Form.Item
              name="oldPassword"
              label="原密码"
              rules={[
                { required: true, message: '请输入原密码' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入原密码" />
            </Form.Item>
            
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, max: 20, message: '密码长度必须在6到20个字符之间' }
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请输入新密码" />
            </Form.Item>
            
            <Form.Item
              name="confirmPassword"
              label="确认新密码"
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="请确认新密码" />
            </Form.Item>
            
            <Form.Item>
              <Space size="middle">
                <Button 
                  type="primary" 
                  icon={<SaveOutlined />} 
                  htmlType="submit"
                  loading={saving}
                >
                  修改密码
                </Button>
                <Button 
                  icon={<CloseOutlined />} 
                  onClick={() => passwordForm.resetFields()}
                >
                  取消
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </div>
      )
    },
    {
      key: 'privacy',
      label: (
        <span>
          <KeyOutlined />
          隐私管理
        </span>
      ),
      children: (
        <div style={{ padding: '20px 0' }}>
          <Form
            form={privacyForm}
            layout="vertical"
            onFinish={handleSavePrivacy}
          >
            <Form.Item
              name="showProfile"
              label="谁可以查看我的个人资料"
              valuePropName="checked"
            >
              <Switch defaultChecked={true} />
            </Form.Item>
            
            <Form.Item
              name="allowMessages"
              label="谁可以给我发送私信"
              valuePropName="checked"
            >
              <Switch defaultChecked={true} />
            </Form.Item>
            
            <Form.Item
              name="allowFollow"
              label="允许他人关注我"
              valuePropName="checked"
            >
              <Switch defaultChecked={true} />
            </Form.Item>
            
            <Form.Item
              name="showPosts"
              label="谁可以查看我的帖子"
              valuePropName="checked"
            >
              <Switch defaultChecked={true} />
            </Form.Item>
            
            <Form.Item
              name="saveHistory"
              label="保存浏览历史"
              valuePropName="checked"
            >
              <Switch defaultChecked={true} />
            </Form.Item>
            
            <Form.Item>
              <Button 
                type="primary" 
                icon={<SaveOutlined />} 
                htmlType="submit"
                loading={saving}
              >
                保存隐私设置
              </Button>
            </Form.Item>
          </Form>
        </div>
      )
    },

  ]

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <Title level={2}>设置中心</Title>
      <Card>
        <Tabs activeKey={activeTab} onChange={handleTabChange} items={items} />
      </Card>
      
      {/* 反馈模态框 */}
      <Modal
        title="提交反馈"
        open={feedbackModalVisible}
        onCancel={handleFeedbackModalClose}
        footer={null}
        width={600}
      >
        <Feedback />
      </Modal>
    </div>
  )
}

export default Settings