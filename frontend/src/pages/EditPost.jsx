import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'

// 导入组件
import PostForm from '../components/PostForm'

const EditPost = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  // 模拟帖子数据
  const mockPostData = {
    id: id,
    title: '如何高效准备期末考试？',
    categoryId: 1,
    type: 'normal',
    content: '马上就要期末考试了，大家有什么好的复习方法分享吗？\n\n我最近在准备期末考试，感觉时间不够用，有些课程还没有开始复习。希望大家能分享一些高效的复习方法，比如如何制定复习计划，如何高效记忆知识点，如何处理压力等等。\n\n谢谢大家！',
    images: []
  }

  const handleSubmit = (values) => {
    console.log('Post updated:', values)
    // 提交成功后跳转到帖子详情页
    navigate(`/posts/${id}`)
  }

  return (
    <div>
      <PostForm 
        onSubmit={handleSubmit} 
        initialValues={mockPostData} 
        title="编辑帖子" 
        submitText="保存修改" 
      />
    </div>
  )
}

export default EditPost