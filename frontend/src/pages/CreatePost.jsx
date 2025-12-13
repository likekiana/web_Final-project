import React from 'react'
import { useNavigate } from 'react-router-dom'

// 导入组件
import PostForm from '../components/PostForm'

const CreatePost = () => {
  const navigate = useNavigate()

  const handleSubmit = (values) => {
    console.log('Post submitted:', values)
    // 提交成功后跳转到首页或帖子详情页
    navigate('/')
  }

  return (
    <div>
      <PostForm 
        onSubmit={handleSubmit} 
        title="发布新帖" 
        submitText="发布帖子" 
      />
    </div>
  )
}

export default CreatePost