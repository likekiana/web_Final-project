import React, { useState } from 'react'
import { Form, Input, Button, Select, message } from 'antd'
import { SendOutlined } from '@ant-design/icons'
import { messageAPI } from '../services/api'

const { TextArea } = Input
const { Option } = Select

const Feedback = () => {
  const [form] = Form.useForm()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (values) => {
    setSubmitting(true)
    try {
      // 这里应该调用API提交反馈
      // 目前模拟提交成功
      message.success('反馈提交成功')
      form.resetFields()
    } catch (error) {
      console.error('Failed to submit feedback:', error)
      message.error('反馈提交失败，请重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        name="type"
        label="反馈类型"
        rules={[{ required: true, message: '请选择反馈类型' }]}
      >
        <Select placeholder="请选择反馈类型">
          <Option value="bug">Bug报告</Option>
          <Option value="feature">功能建议</Option>
          <Option value="feedback">意见反馈</Option>
          <Option value="other">其他</Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="title"
        label="反馈标题"
        rules={[
          { required: true, message: '请输入反馈标题' },
          { min: 5, max: 50, message: '反馈标题长度必须在5到50个字符之间' }
        ]}
      >
        <Input placeholder="请输入反馈标题" />
      </Form.Item>

      <Form.Item
        name="content"
        label="反馈内容"
        rules={[
          { required: true, message: '请输入反馈内容' },
          { min: 10, max: 1000, message: '反馈内容长度必须在10到1000个字符之间' }
        ]}
      >
        <TextArea
          placeholder="请详细描述您的问题或建议"
          rows={6}
          style={{ resize: 'vertical' }}
        />
      </Form.Item>

      <Form.Item
        name="contact"
        label="联系方式（可选）"
        rules={[
          { max: 50, message: '联系方式长度不能超过50个字符' }
        ]}
      >
        <Input placeholder="请输入邮箱或手机号，方便我们联系您" />
      </Form.Item>

      <Form.Item>
        <Button
          type="primary"
          icon={<SendOutlined />}
          htmlType="submit"
          loading={submitting}
          block
        >
          提交反馈
        </Button>
      </Form.Item>
    </Form>
  )
}

export default Feedback