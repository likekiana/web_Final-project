import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Upload, Card, Typography, message } from 'antd'
import { UploadOutlined, FileImageOutlined } from '@ant-design/icons'

// 导入API服务
import { categoryAPI, postAPI } from '../services/api'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const PostForm = ({ onSubmit, initialValues = {}, title = '发布新帖', submitText = '发布帖子' }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [categories, setCategories] = useState([])

  // 从API获取板块数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories()
        console.log('Categories response:', response)
        
        // 修复数据处理逻辑，确保能正确提取板块数据
        let categoriesData = []
        
        if (response) {
          // 检查多种可能的响应格式
          if (response.success) {
            // 后端返回格式：{success: true, message: '获取成功', data: Array(5)}
            categoriesData = Array.isArray(response.data) ? response.data : []
          } else if (Array.isArray(response)) {
            categoriesData = response
          } else if (Array.isArray(response.data)) {
            categoriesData = response.data
          }
        }
        
        setCategories(categoriesData)
        console.log('Categories set:', categoriesData)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
        message.error('获取板块数据失败')
      }
    }

    fetchCategories()
  }, [])

  // 直接使用categories数组，不再需要额外处理

  // 帖子类型选项
  const postTypeOptions = [
    { value: 'normal', label: '普通帖子' },
    { value: 'trade', label: '二手交易' },
    { value: 'advertisement', label: '广告帖子' }
  ]

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 直接使用表单值，确保字段名与后端一致
      const postData = {
        title: values.title,
        content: values.content,
        category_id: values.categoryId, // 使用后端期望的字段名
        type: values.type || 'normal'
        // 图片上传功能暂不实现
      }
      
      // 调用API创建帖子
      const response = await postAPI.createPost(postData)
      if (response.success) {
        message.success('帖子发布成功')
        setLoading(false)
        if (onSubmit) {
          onSubmit(response.data)
        }
      } else {
        message.error(response.message || '帖子发布失败')
        setLoading(false)
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      message.error('帖子发布失败，请稍后重试')
      setLoading(false)
    }
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
            {categories.map(category => (
              <Option key={category.id} value={category.id}>
                {category.name}
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