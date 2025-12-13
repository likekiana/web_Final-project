import React from 'react'
import { useParams } from 'react-router-dom'

// 导入组件
import PostDetail from '../components/PostDetail'
import CommentList from '../components/CommentList'

const PostDetailPage = () => {
  const { id } = useParams()
  
  const handleCommentPageChange = (page, pageSize) => {
    console.log('Comment page changed:', page, pageSize)
    // 这里可以添加获取新一页评论数据的逻辑
  }

  return (
    <div>
      {/* 帖子详情 */}
      <PostDetail postId={id} />
      
      {/* 评论列表 */}
      <CommentList postId={id} onPageChange={handleCommentPageChange} />
    </div>
  )
}

export default PostDetailPage