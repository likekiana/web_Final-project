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
    } else {
      setCategory(null)
    }

    // 调用通用的fetchPosts函数获取帖子数据
    fetchPosts()
  }, [searchParams, category])

  // 定义一个通用的获取帖子列表函数，用于处理各种筛选条件
  const fetchPosts = async (page = 1, pageSize = 10) => {
    setLoading(true)
    try {
      // 从URL获取当前的搜索参数和排序参数
      const searchParams = new URLSearchParams(window.location.search);
      const keyword = searchParams.get('keyword') || '';
      const sortBy = searchParams.get('sortBy') || 'createdAt';
      const order = searchParams.get('order') || 'desc';
      
      const params = {
        keyword: keyword || undefined,
        categoryId: category || undefined,
        page: page,
        limit: pageSize,
        sortBy: sortBy,
        order: order
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

  const handlePageChange = async (page, pageSize) => {
    fetchPosts(page, pageSize)
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f5f7fa' }}>
      {/* 顶部横幅区域 */}
      <div style={{ 
        backgroundColor: '#1890ff', 
        color: 'white', 
        padding: '40px 0', 
        marginBottom: '32px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
        backgroundImage: 'linear-gradient(135deg, #1890ff 0%, #52c41a 100%)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <Title level={2} style={{ margin: 0, color: 'white', textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)' }}>欢迎使用校园通论坛</Title>
              <Paragraph style={{ margin: '8px 0 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
                连接校园，分享知识，交流思想
              </Paragraph>
            </div>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              size="large"
              onClick={() => navigate('/posts/create')}
              style={{ 
                backgroundColor: 'white', 
                color: '#1890ff', 
                border: 'none',
                boxShadow: '0 4px 12px rgba(24, 144, 255, 0.3)',
                padding: '0 24px',
                height: '48px',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              发布新帖
            </Button>
          </div>
        </div>
      </div>
      
      {/* 主要内容区域 */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 16px', marginBottom: '48px' }}>
        {/* 平台介绍卡片 */}
        <Card 
          style={{ 
            marginBottom: '32px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: 'none'
          }}
        >
          <Paragraph style={{ 
            margin: 0, 
            fontSize: '16px', 
            lineHeight: '1.8',
            color: '#595959'
          }}>
            校园信息聚合论坛系统（校园通）是为了解决大学校园内信息分散、获取不便的问题，创建的一个结构化、可搜索、可沉淀的校园社区平台。
            在这里，你可以发布和浏览各类校园信息，参与讨论，获取帮助，与其他同学和老师建立联系。
          </Paragraph>
        </Card>
        
        {/* 帖子列表组件 */}
        <Card 
          style={{ 
            marginBottom: '32px', 
            borderRadius: '12px', 
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: 'none',
            overflow: 'hidden'
          }}
          title={<div style={{ fontSize: '20px', fontWeight: 'bold', color: '#262626' }}>最新帖子</div>}
        >
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
        </Card>
        
        {/* AI智能问答机器人 */}
        <div style={{ 
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          borderRadius: '12px',
          padding: '32px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.08)',
          border: '1px solid #bae6fd'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <Title level={3} style={{ margin: 0, color: '#1e40af' }}>AI智能助手</Title>
            <Paragraph style={{ margin: '8px 0 0 0', color: '#3b82f6' }}>
              24小时为您解答校园相关问题
            </Paragraph>
          </div>
          <Row gutter={[32, 32]}>
            <Col xs={24} lg={12}>
              <Card 
                style={{ 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0'
                }}
              >
                <AIAssistant />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card 
                title={<div style={{ fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>AI功能说明</div>}
                style={{ 
                  borderRadius: '12px', 
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                  border: '1px solid #e2e8f0'
                }}
              >
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
                    <List.Item style={{ padding: '16px 0', borderBottom: '1px solid #f0f0f0' }}>
                      <List.Item.Meta
                        title={<div style={{ 
                          fontSize: '16px', 
                          fontWeight: 'bold', 
                          color: '#262626',
                          marginBottom: '8px'
                        }}>{item.title}</div>}
                        description={<div style={{ 
                          fontSize: '14px', 
                          color: '#595959',
                          lineHeight: '1.6'
                        }}>{item.content}</div>}
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </div>
  )
}

export default Home