import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link, useSearchParams } from 'react-router-dom'
import PostList from '../components/PostList'

const { Title, Paragraph } = Typography

const Home = () => {
  const [searchParams] = useSearchParams()
  const [category, setCategory] = useState(null)
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // 从URL获取板块筛选参数
    const categoryParam = searchParams.get('category')
    if (categoryParam) {
      setCategory(parseInt(categoryParam))
    }

    // 模拟获取帖子数据
    const fetchPosts = async () => {
      setLoading(true)
      try {
        // 这里应该调用API获取帖子数据
        // 模拟API请求
        setTimeout(() => {
          setLoading(false)
        }, 500)
      } catch (error) {
        console.error('Failed to fetch posts:', error)
        setLoading(false)
      }
    }

    fetchPosts()
  }, [searchParams])

  const handlePageChange = (page, pageSize) => {
    console.log('Page changed:', page, pageSize)
    // 这里应该调用API获取新一页的帖子数据
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0 }}>欢迎使用校园通论坛</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />}
          size="large"
          as={Link} 
          to="/posts/create"
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