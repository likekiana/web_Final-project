import React, { useState } from 'react'
import { Form, Input, Button, Card, Typography, message, Row, Col } from 'antd'
import { LockOutlined, UserOutlined, MailOutlined } from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

const { Title } = Typography

const Register = () => {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      // 删除confirmPassword字段，后端不需要
      const { confirmPassword, ...registerData } = values
      const response = await authAPI.register(registerData)
      if (response.success) {
        message.success('注册成功，请登录')
        setLoading(false)
        navigate('/login')
      } else {
        message.error(response.message || '注册失败')
        setLoading(false)
      }
    } catch (error) {
      console.error('Register error:', error)
      message.error('注册失败，请稍后重试')
      setLoading(false)
    }
  }

  return (
    <Row justify="center" align="middle" style={{ minHeight: '80vh' }}>
      <Col xs={22} sm={18} md={14} lg={10} xl={8}>
        <Card
          title={
            <Title level={3} style={{ margin: 0, textAlign: 'center' }}>
              校园通论坛 - 注册
            </Title>
          }
          style={{ borderRadius: 8, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}
        >
          <Form
            name="register"
            onFinish={onFinish}
            layout="vertical"
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
                prefix={<MailOutlined />}
                placeholder="请输入学校邮箱"
                autoComplete="email"
              />
            </Form.Item>

            <Form.Item
              name="username"
              rules={[
                { required: true, message: '请输入用户名!' },
                { min: 2, message: '用户名长度不能少于2个字符!' },
                { max: 20, message: '用户名长度不能超过20个字符!' }
              ]}
              label="用户名"
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="请输入用户名"
                autoComplete="username"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[
                { required: true, message: '请输入密码!' },
                { min: 6, message: '密码长度不能少于6个字符!' }
              ]}
              label="密码"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请输入密码"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['password']}
              rules={[
                { required: true, message: '请确认密码!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error('两次输入密码不一致!'))
                  }
                })
              ]}
              label="确认密码"
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="请再次输入密码"
                autoComplete="new-password"
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
                注册
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              已有账号？ <Link to="/login">立即登录</Link>
            </div>
          </Form>
        </Card>
      </Col>
    </Row>
  )
}

export default Register