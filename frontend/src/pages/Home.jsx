import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import PostList from '../components/PostList'
import { postAPI } from '../services/api'

const { Title, Paragraph } = Typography

const Home = () => {
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // 从URL获取板块筛选参数
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategory(parseInt(categoryParam))
    }

    // 调用API获取帖子数据
      const fetchPosts = async () => {
        setLoading(true)
        try {
          const params = {
            categoryId: category || undefined
          }
          const response = await postAPI.getPosts(params)
          // 后端返回的格式是 {success: true, message: '获取成功', data: {posts: [...], pagination: {...}}}
          setPosts(response.data?.posts || [])
          setLoading(false)
        } catch (error) {
          console.error('Failed to fetch posts:', error)
          setPosts([])
          setLoading(false)
        }
      }

    fetchPosts()
  }, [searchParams, category])

  const handlePageChange = async (page, pageSize) => {
    setLoading(true)
    try {
      const params = {
        categoryId: category || undefined,
        page: page,
        limit: pageSize
      }
      const response = await postAPI.getPosts(params)
      // 后端返回的格式是 {success: true, message: '获取成功', data: {posts: [...], pagination: {...}}}
      setPosts(response.data?.posts || [])
      setLoading(false)
    } catch (error) {
      console.error('Failed to fetch posts:', error)
      setLoading(false)
    }
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>欢迎使用校园通论坛</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          onClick={() => navigate('/posts/create')}
        >
          发布新帖
        </Button>
      </div>
      
      <Paragraph style={{ marginBottom: 32 }}>
        校园信息聚合论坛系统（校园通）是为了解决大学校园内信息分散、获取不便的问题，创建的一个结构化、可搜索、可沉淀的校园社区平台。
      </Paragraph>
      
      {/* 帖子列表组件 */}
      <PostList 
        posts={posts}
        category={category}
        onPageChange={handlePageChange}
      />
    </div>
  )
}

export default Home