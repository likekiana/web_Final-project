import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd'
import { LockOutlined, UserOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

const { Title } = Typography

const Login = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const response = await authAPI.login(values)
      if (response.success) {
        // 保存access token到localStorage
        localStorage.setItem('token', response.data?.token?.access)
        message.success('登录成功')
        setLoading(false)
        
        // 根据用户角色跳转到不同页面
        const userRole = response.data?.user?.role
        if (userRole === 'admin' || userRole === 'superAdmin') {
          navigate('/admin')
        } else {
          navigate('/')
        }
      } else {
        message.error(response.message || '登录失败')
        setLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      message.error('登录失败，请检查邮箱和密码')
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
      <Col xs={22} sm={18} md={14} lg={10} xl={8}>
        <Card
          title={
            <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
              校园通论坛 - 登录
            </Title>
          }
          style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          <Form
            name="login"
            onFinish={onFinish}
            layout="vertical"
            initialValues={{ remember: true }}
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入您的邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' },
                { pattern: /@.*\.edu\.cn$/, message: '请使用学校邮箱（@xx.edu.cn）注册!' }
              ]}
              label="邮箱"
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入学校邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
              label="密码"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                登录
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              还没有账号？ <Link to="/register">立即注册</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default Login