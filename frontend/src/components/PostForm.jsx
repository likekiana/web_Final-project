import React, { useState } from 'react'
import { Form, Input, Select, Button, Upload, Card, Typography, message } from 'antd'
import { UploadOutlined, FileImageOutlined } from '@ant-design/icons'

// 导入板块配置
import categories from '../config/categories'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const PostForm = ({ onSubmit, initialValues = {}, title = '发布新帖', submitText = '发布帖子' }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')

  // 板块选项（从配置文件生成）
  const categoryOptions = categories.map(category => ({
    value: category.id,
    label: category.name
  }))

  // 帖子类型选项
  const postTypeOptions = [
    { value: 'normal', label: '普通帖子' },
    { value: 'trade', label: '二手交易' },
    { value: 'advertisement', label: '广告帖子' }
  ]

  const handleSubmit = (values) => {
    setLoading(true)
    // 模拟提交请求
    setTimeout(() => {
      message.success('帖子发布成功')
      setLoading(false)
      if (onSubmit) {
        onSubmit(values)
      }
    }, 1500)
  }

  const handlePreview = (file) => {
    setPreviewImage(file.url || file.thumbUrl)
    setPreviewVisible(true)
  }

  const handleCancelPreview = () => {
    setPreviewVisible(false)
  }

  const handleChange = ({ fileList }) => {
    // 这里可以处理文件上传的逻辑
    console.log('File list changed:', fileList)
  }

  return (
    <Card title={<Title level={3} style={{ margin: 0 }}>{title}</Title>}>
      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={initialValues}
      >
        <Form.Item
          name="title"
          rules={[
            { required: true, message: '请输入帖子标题!' },
            { min: 2, message: '标题长度不能少于2个字符!' },
            { max: 100, message: '标题长度不能超过100个字符!' }
          ]}
          label="帖子标题"
        >
          <Input placeholder="请输入帖子标题" size="large" />
        </Form.Item>

        <Form.Item
          name="categoryId"
          rules={[{ required: true, message: '请选择板块!' }]}
          label="所属板块"
        >
          <Select placeholder="请选择板块" size="large">
            {categoryOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="type"
          rules={[{ required: true, message: '请选择帖子类型!' }]}
          label="帖子类型"
        >
          <Select placeholder="请选择帖子类型" size="large">
            {postTypeOptions.map(option => (
              <Option key={option.value} value={option.value}>
                {option.label}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="content"
          rules={[{ required: true, message: '请输入帖子内容!' }]}
          label="帖子内容"
        >
          <TextArea
            rows={8}
            placeholder="请输入帖子内容"
            autoSize={{ minRows: 8, maxRows: 16 }}
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="images"
          label="上传图片（可选）"
        >
          <Upload
            action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
            listType="picture-card"
            fileList={form.getFieldValue('images')}
            onPreview={handlePreview}
            onChange={handleChange}
            beforeUpload={() => false} // 阻止自动上传，实际项目中需要调整
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
          {previewVisible && (
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
              <img src={previewImage} alt="预览" style={{ maxWidth: '90%', maxHeight: '90%' }} />
              <Button type="primary" onClick={handleCancelPreview} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10000 }}>
                关闭
              </Button>
            </div>
          )}
        </Form.Item>

        <Form.Item style={{ textAlign: 'right' }}>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
          >
            {submitText}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  )
}

export default PostForm