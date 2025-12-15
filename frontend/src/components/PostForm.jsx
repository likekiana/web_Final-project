import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Upload, Card, Typography, message, Row, Col } from 'antd'
import { UploadOutlined, FileImageOutlined, BulbOutlined, EditOutlined, AlignLeftOutlined, ExpandOutlined } from '@ant-design/icons'

// 导入API服务
import { categoryAPI, postAPI, aiAPI } from '../services/api'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

const PostForm = ({ onSubmit, initialValues = {}, title = '发布新帖', submitText = '发布帖子' }) => {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [previewVisible, setPreviewVisible] = useState(false)
  const [previewImage, setPreviewImage] = useState('')
  const [categories, setCategories] = useState([])

  // 从API获取板块数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories()
        console.log('Categories response:', response)
        
        // 正确处理API响应格式：{success: true, message: '获取成功', data: [...板块数据...]} 
        const categoriesData = response.success ? (Array.isArray(response.data) ? response.data : []) : []
        
        setCategories(categoriesData)
        console.log('Categories set:', categoriesData)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        message.error('获取板块数据失败')
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  // AI辅助功能 - 生成标题
  const handleGenerateTitle = async () => {
    const content = form.getFieldValue('content')
    if (!content) {
      message.warning('请先输入帖子内容')
      return
    }

    try {
      setAiLoading(true)
      const response = await aiAPI.generateTitle({ content })
      if (response.success && response.data) {
        form.setFieldValue('title', response.data.title)
        message.success('标题生成成功')
      } else {
        message.error('标题生成失败，请重试')
      }
    } catch (error) {
      console.error('Failed to generate title:', error.response?.data || error.message || error)
      message.error('标题生成失败，请稍后重试')
    } finally {
      setAiLoading(false)
    }
  }

  // AI辅助功能 - 生成摘要
  const handleGenerateSummary = async () => {
    const content = form.getFieldValue('content')
    if (!content) {
      message.warning('请先输入帖子内容')
      return
    }

    try {
      setAiLoading(true)
      const response = await aiAPI.generateSummary({ content })
      if (response.success && response.data) {
        // 可以将摘要用于其他用途，比如SEO描述
        message.success('摘要生成成功')
        console.log('Generated summary:', response.data.summary)
      } else {
        message.error('摘要生成失败，请重试')
      }
    } catch (error) {
      console.error('Failed to generate summary:', error)
      message.error('摘要生成失败，请稍后重试')
    } finally {
      setAiLoading(false)
    }
  }

  // AI辅助功能 - 扩展内容
  const handleExpandContent = async () => {
    const keywords = form.getFieldValue('title')?.split(' ').filter(word => word.length > 1) || []
    const categoryId = form.getFieldValue('categoryId')
    const categoryName = categories.find(cat => cat.id === categoryId)?.name || '其他'
    
    if (keywords.length === 0) {
      message.warning('请先输入帖子标题或关键词')
      return
    }

    try {
          setAiLoading(true)
          const response = await aiAPI.expandContent({ keywords, category: categoryName })
          if (response.success && response.data) {
            const currentContent = form.getFieldValue('content') || ''
            form.setFieldValue('content', currentContent + '\n\n' + response.data.expanded_content)
            message.success('内容扩展成功')
          } else {
            message.error('内容扩展失败，请重试')
          }
        } catch (error) {
          console.error('Failed to expand content:', error)
          message.error('内容扩展失败，请稍后重试')
        } finally {
          setAiLoading(false)
        }
  }

  const handleSubmit = async (values) => {
    setLoading(true)
    try {
      // 直接使用表单值，确保字段名与后端一致
      const postData = {
        title: values.title,
        content: values.content,
        category_id: values.categoryId, // 使用后端期望的字段名
        media_files: values.mediaFiles || [], // 媒体文件数组，支持图片和视频
        type: values.isAnonymous ? 'anonymous' : 'normal' // 帖子类型，匿名或普通
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

        {/* AI辅助功能区 */}
        <Card title={<><BulbOutlined /> AI 帖子创作辅助</>} size="small" style={{ marginBottom: 16 }}>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <Button 
                type="default" 
                icon={<EditOutlined />} 
                onClick={handleGenerateTitle}
                loading={aiLoading}
                block
              >
                AI生成标题
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                type="default" 
                icon={<AlignLeftOutlined />} 
                onClick={handleGenerateSummary}
                loading={aiLoading}
                block
              >
                AI生成摘要
              </Button>
            </Col>
            <Col span={8}>
              <Button 
                type="default" 
                icon={<ExpandOutlined />} 
                onClick={handleExpandContent}
                loading={aiLoading}
                block
              >
                AI扩展内容
              </Button>
            </Col>
          </Row>
        </Card>

        <Form.Item
          name="categoryId"
          rules={[{ required: true, message: '请选择板块!' }]}
          label="所属板块"
        >
          <Select placeholder="请选择板块" size="large">
            {categories.map(category => (
              <Select.Option key={category.id} value={category.id}>
                {category.name}
              </Select.Option>
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
          name="mediaFiles"
          label="上传图片/视频（可选）"
        >
          <Upload
            listType="picture-card"
            fileList={form.getFieldValue('mediaFiles') || []}
            onPreview={handlePreview}
            onChange={handleChange}
            beforeUpload={() => false} // 实际项目中需先上传到存储服务，然后提交URL
            accept="image/*,video/*" // 支持图片和视频文件
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>上传</div>
            </div>
          </Upload>
          {previewVisible && (
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
              {previewImage.endsWith('.mp4') || previewImage.endsWith('.mov') || previewImage.endsWith('.avi') ? (
                <video src={previewImage} controls style={{ maxWidth: '90%', maxHeight: '90%' }} />
              ) : (
                <img src={previewImage} alt="预览" style={{ maxWidth: '90%', maxHeight: '90%' }} />
              )}
              <Button type="primary" onClick={handleCancelPreview} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10000 }}>
                关闭
              </Button>
            </div>
          )}
        </Form.Item>

        <Form.Item
          name="isAnonymous"
          valuePropName="checked"
          initialValue={false}
        >
          <div>
            <input type="checkbox" />
            <span style={{ marginLeft: 8 }}>匿名发帖（真情流露区）</span>
          </div>
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