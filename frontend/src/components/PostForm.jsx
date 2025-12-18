import React, { useState, useEffect } from 'react'
import { Form, Input, Select, Button, Upload, Card, Typography, message, Row, Col } from 'antd'
import { UploadOutlined, FileImageOutlined, BulbOutlined, EditOutlined, AlignLeftOutlined, ExpandOutlined } from '@ant-design/icons'

// 导入API服务
import { categoryAPI, postAPI, aiAPI } from '../services/api'

// 创建axios实例，用于文件上传
import axios from 'axios'
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'multipart/form-data'
  }
})

// 请求拦截器，添加token
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

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
  // 媒体文件状态管理
  const [mediaFiles, setMediaFiles] = useState([])

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
    const title = form.getFieldValue('title')
    const content = form.getFieldValue('content')
    const categoryId = form.getFieldValue('categoryId')
    const categoryName = categories.find(cat => cat.id === categoryId)?.name || '其他'
    
    // 智能提取关键词：从标题和内容中提取
    let keywords = []
    
    // 从标题提取关键词
    if (title) {
      // 简单的关键词提取：使用常见分隔符分割，过滤短词
      const titleKeywords = title
        .split(/[\s,，；;。.、]/) // 使用多种分隔符
        .filter(word => word.length > 1) // 过滤单个字符
        .slice(0, 5) // 最多提取5个关键词
      keywords = [...keywords, ...titleKeywords]
    }
    
    // 从内容提取关键词（如果内容存在）
    if (content && content.length > 20) {
      const contentKeywords = content
        .split(/[\s,，；;。.、]/)
        .filter(word => word.length > 1)
        .slice(0, 3) // 最多从内容提取3个关键词
      keywords = [...keywords, ...contentKeywords]
    }
    
    // 去重
    keywords = [...new Set(keywords)]
    
    if (keywords.length === 0) {
      message.warning('请先输入帖子标题或关键词')
      return
    }

    try {
      setAiLoading(true)
      const response = await aiAPI.expandContent({ keywords, category: categoryName })
      if (response.success && response.data?.expanded_content) {
        const currentContent = form.getFieldValue('content') || ''
        // 如果当前内容为空，直接使用扩展内容；否则添加到现有内容后
        const newContent = currentContent ? currentContent + '\n\n' + response.data.expanded_content : response.data.expanded_content
        form.setFieldValue('content', newContent)
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
      // 1. 上传媒体文件，获取URL数组
      const mediaUrls = []
      
      // 2. 逐个上传文件
      for (const mediaFile of mediaFiles) {
        if (mediaFile.status !== 'done') {
          const formData = new FormData()
          formData.append('file', mediaFile.file)
          
          try {
            const response = await api.post('/posts/upload', formData)
            if (response.data?.success && response.data?.data?.url) {
              mediaUrls.push(response.data.data.url)
              // 更新文件状态为已上传
              setMediaFiles(mediaFiles.map(item => {
                if (item.uid === mediaFile.uid) {
                  return { ...item, status: 'done', response: response.data }
                }
                return item
              }))
            }
          } catch (uploadError) {
            console.error('Failed to upload media file:', uploadError)
            message.error(`文件 ${mediaFile.name} 上传失败`)
          }
        } else if (mediaFile.response?.data?.url) {
          // 如果已经上传成功，直接使用URL
          mediaUrls.push(mediaFile.response.data.url)
        }
      }
      
      // 3. 准备帖子数据
      const postData = {
        title: values.title,
        content: values.content,
        category_id: values.categoryId,
        media_files: mediaUrls,
        type: values.isAnonymous ? 'anonymous' : 'normal' // 帖子类型，匿名或普通
      }
      
      console.log('Post data:', postData)
      
      // 4. 调用API创建帖子
      const response = await postAPI.createPost(postData)
      if (response.success) {
        message.success('帖子发布成功')
        setLoading(false)
        // 重置媒体文件列表
        setMediaFiles([])
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

  // 预览功能已经集成到onChange和onPreview中，不需要单独的handlePreview函数
  // 直接在Upload组件的onPreview属性中定义匿名函数
  
  const handleCancelPreview = () => {
    setPreviewVisible(false)
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
            { min: 5, message: '标题长度不能少于5个字符!' },
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
          label="上传图片/视频（可选）"
        >
          <Upload
            listType="picture-card"
            fileList={mediaFiles}
            beforeUpload={(file) => {
              // 验证文件大小
              const isLt10M = file.size / 1024 / 1024 < 10
              if (!isLt10M) {
                message.error('文件大小不能超过10MB')
                return Upload.LIST_IGNORE
              }
              // 验证文件类型
              const isImageOrVideo = file.type.startsWith('image/') || file.type.startsWith('video/')
              if (!isImageOrVideo) {
                message.error('只允许上传图片和视频文件')
                return Upload.LIST_IGNORE
              }
              // 生成预览URL
              const previewUrl = URL.createObjectURL(file)
              // 添加到媒体文件列表
              setMediaFiles([...mediaFiles, { 
                uid: Date.now(), 
                name: file.name, 
                status: 'ready', 
                url: previewUrl,
                file: file // 保存原始文件对象
              }])
              // 阻止自动上传
              return false
            }}
            onRemove={(file) => {
              // 从媒体文件列表中移除
              setMediaFiles(mediaFiles.filter(item => item.uid !== file.uid))
              return true
            }}
            onPreview={(file) => {
              setPreviewImage(file.url)
              setPreviewVisible(true)
            }}
            maxCount={5}
          >
            <div>
              <UploadOutlined />
              <div style={{ marginTop: 8 }}>点击上传</div>
            </div>
          </Upload>
          {previewVisible && (
            <div style={{ position: 'fixed', top: 0, right: 0, bottom: 0, left: 0, background: 'rgba(0, 0, 0, 0.8)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 9999 }}>
              {previewImage.endsWith('.mp4') || previewImage.endsWith('.mov') || previewImage.endsWith('.avi') || previewImage.endsWith('.quicktime') ? (
                <video src={previewImage} controls style={{ maxWidth: '90%', maxHeight: '90%' }} />
              ) : (
                <img src={previewImage} alt="预览" style={{ maxWidth: '90%', maxHeight: '90%' }} />
              )}
              <Button type="primary" onClick={() => setPreviewVisible(false)} style={{ position: 'absolute', top: 20, right: 20, zIndex: 10000 }}>
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