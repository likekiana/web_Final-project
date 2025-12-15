import React, { useState, useEffect } from 'react'
import { Typography, Row, Col, Button, Card, List } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import PostList from '../components/PostList'
import AIAssistant from '../components/AIAssistant'
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
      
      {/* AI智能问答机器人 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        <Col xs={24} lg={12}>
          <AIAssistant />
        </Col>
        <Col xs={24} lg={12}>
          <Card title="AI功能说明">
            <List
              dataSource={[
                {
                  title: '智能问答',
                  content: '针对校园常见问题提供自动回复，支持关键词匹配和语义理解。'
                },
                {
                  title: '帖子创作辅助',
                  content: '在发帖页面提供AI辅助，包括自动生成标题、摘要和内容扩展。'
                },
                {
                  title: '智能搜索增强',
                  content: '支持自然语言搜索，理解用户意图，返回更精准的结果。'
                }
              ]}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    title={item.title}
                    description={item.content}
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
      
      {/* 帖子列表组件 */}
      <PostList 
        posts={posts}
        category={category}
        onPageChange={handlePageChange}
        onCategoryChange={(categoryId) => {
          const newSearchParams = new URLSearchParams(searchParams);
          if (categoryId) {
            newSearchParams.set('category', categoryId);
          } else {
            newSearchParams.delete('category');
          }
          navigate(`?${newSearchParams.toString()}`);
        }}
      />
    </div>
  )
}

export default Home