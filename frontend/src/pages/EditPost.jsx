import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import PostForm from '../components/PostForm'

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [initialValues, setInitialValues] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 模拟获取帖子数据
    const fetchPost = async () => {
      setLoading(true)
      try {
        // 这里应该调用API获取帖子数据
        // 模拟API请求
        setTimeout(() => {
          const mockPost = {
            id: id,
            title: '如何高效准备期末考试？',
            categoryId: 1,
            type: 'normal',
            content: '马上就要期末考试了，大家有什么好的复习方法分享吗？我最近在准备期末考试，感觉时间不够用，有些课程还没有开始复习。希望大家能分享一些高效的复习方法，比如如何制定复习计划，如何高效记忆知识点，如何处理压力等等。谢谢大家！',
            images: []
          }
          setInitialValues(mockPost)
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error('Failed to fetch post:', error)
        setLoading(false)
      }
    }

    fetchPost()
  }, [id])

  const handleSubmit = (values) => {
    console.log('Post updated:', values)
    // 提交成功后跳转到帖子详情页
    navigate(`/posts/${id}`)
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
