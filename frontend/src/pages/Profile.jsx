import React, { useState } from 'react'
import { Card, Typography, Avatar, Button, Row, Col, Form, Input, Upload, message } from 'antd'
import { UserOutlined, CameraOutlined, LogoutOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Title, Paragraph } = Typography
const { TextArea } = Input

const Profile = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  // 模拟用户数据
  const userData = {
    id: 1,
    username: 'testuser',
    email: 'test@example.edu.cn',
    avatar: null,
    bio: '这是我的个人简介，我是一名大学生。',
    role: 'student',
    reputation: 100,
    postCount: 5,
    createdAt: '2023-01-01'
  }

  const handleLogout = () => {
    message.success('退出登录成功')
    navigate('/login')
  }

  const handleSave = (values) => {
    setLoading(true)
    // 模拟保存请求
    setTimeout(() => {
      message.success('个人资料更新成功')
      setLoading(false)
    }, 1000)
  }

  return (
    <div>
      <Title level={2}>个人中心</Title>
      
      <Row gutter={[24, 24]}>
        {/* 左侧个人信息卡片 */}
        <Col xs={24} md={8}>
          <Card title="个人信息" hoverable>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <Avatar
                size={120}
                icon={<UserOutlined />}
                src={userData.avatar}
                style={{ marginBottom: 16 }}
              />
              <Title level={4} style={{ margin: 0 }}>{userData.username}</Title>
              <Paragraph type="secondary">{userData.email}</Paragraph>
              <Paragraph type="secondary">注册时间：{userData.createdAt}</Paragraph>
            </div>
            
            <div style={{ marginTop: 20 }}>
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={3}>{userData.postCount}</Title>
                    <Paragraph type="secondary">发帖数</Paragraph>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ textAlign: 'center' }}>
                    <Title level={3}>{userData.reputation}</Title>
                    <Paragraph type="secondary">信誉值</Paragraph>
                  </div>
                </Col>
              </Row>
            </div>
            
            <Button
              type="danger"
              icon={<LogoutOutlined />}
              block
              onClick={handleLogout}
              style={{ marginTop: 20 }}
            >
              退出登录
            </Button>
          </Card>
        </Col>
        
        {/* 右侧个人资料编辑 */}
        <Col xs={24} md={16}>
          <Card title="编辑个人资料" hoverable>
            <Form
              layout="vertical"
              initialValues={{ username: userData.username, bio: userData.bio }}
              onFinish={handleSave}
            >
              <Form.Item
                name="username"
                rules={[
                  { required: true, message: '请输入用户名!' },
                  { min: 2, message: '用户名长度不能少于2个字符!' },
                  { max: 20, message: '用户名长度不能超过20个字符!' }
                ]}
                label="用户名"
              >
                <Input placeholder="请输入用户名" />
              </Form.Item>
              
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: '请输入邮箱!' },
                  { type: 'email', message: '请输入有效的邮箱地址!' }
                ]}
                label="邮箱"
              >
                <Input placeholder="请输入邮箱" disabled value={userData.email} />
              </Form.Item>
              
              <Form.Item
                name="bio"
                rules={[
                  { max: 200, message: '个人简介不能超过200个字符!' }
                ]}
                label="个人简介"
              >
                <TextArea rows={4} placeholder="请输入个人简介" />
              </Form.Item>
              
              <Form.Item
                name="avatar"
                label="头像"
              >
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  listType="picture-circle"
                  showUploadList={false}
                >
                  <Button icon={<CameraOutlined />}>更换头像</Button>
                </Upload>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit" loading={loading}>
                  保存修改
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
      
      {/* 我的发帖历史 */}
      <Card title="我的发帖历史" hoverable style={{ marginTop: 24 }}>
        <Paragraph type="secondary" style={{ textAlign: 'center', padding: '20px 0' }}>
          您还没有发帖记录，去发布您的第一条帖子吧！
        </Paragraph>
      </Card>
    </div>
  )
}

export default Profile