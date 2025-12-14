import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { message } from 'antd'
import PostForm from '../components/PostForm'
import { postAPI } from '../services/api'

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 从API获取帖子数据
    const fetchPost = async () => {
      setLoading(true)
      try {
        const response = await postAPI.getPostDetail(id)
        if (response.success) {
          const postData = response.data
          setInitialValues({
            id: postData.id,
            title: postData.title,
            categoryId: postData.category_id,
            type: postData.type,
            content: postData.content,
            images: postData.images || []
          })
        } else {
          message.error(response.message || '获取帖子失败')
        }
      } catch (error) {
        console.error('Failed to fetch post:', error)
        message.error('获取帖子失败')
      } finally {
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleSubmit = async (values) => {
    try {
      const response = await postAPI.updatePost(id, values)
      if (response.success) {
        message.success('帖子更新成功')
        // 提交成功后跳转到帖子详情页
        navigate(`/posts/${id}`)
      } else {
        message.error(response.message || '更新失败')
      }
    } catch (error) {
      console.error('Failed to update post:', error)
      message.error('更新帖子失败')
    }
  }

  if (loading) {
    return <div>加载中...</div>
  }

  return (
    <div>
      <PostForm 
        onSubmit={handleSubmit} 
        initialValues={initialValues} 
        title="编辑帖子" 
        submitText="更新帖子" 
      />
    </div>
  )
}

export default EditPost
