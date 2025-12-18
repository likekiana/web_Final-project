import React, { useState, useEffect } from 'react'
import { Card, List, Typography, Avatar, Button, Tag, Space, Pagination, Select, Row, Col, Input, Form, message, AutoComplete } from 'antd'
import { LikeOutlined, CommentOutlined, EyeOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined, UserOutlined, StarOutlined, BulbOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

// 导入API服务
import { categoryAPI, favoriteAPI, aiAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography
const { Option } = Select
const { Search } = Input

const PostList = ({ posts = [], total = 0, page = 1, pageSize = 10, onPageChange, category = null, onCategoryChange }) => {
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [keyword, setKeyword] = useState('')
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])
  // 收藏状态管理，key为帖子id，value为是否收藏
  const [favoritedPosts, setFavoritedPosts] = useState({})
  // 正在收藏/取消收藏的帖子id集合
  const [favoritingPosts, setFavoritingPosts] = useState(new Set())
  // AI搜索建议
  const [searchSuggestions, setSearchSuggestions] = useState([])
  // 搜索加载状态
  const [searchLoading, setSearchLoading] = useState(false)

  // 当category属性变化时，更新selectedCategory状态
  useEffect(() => {
    setSelectedCategory(category)
  }, [category])

  // 从API获取板块数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories()
        // 正确处理API响应格式：{success: true, message: '获取成功', data: [...板块数据...]}
        const categoriesData = response.success ? (Array.isArray(response.data) ? response.data : []) : []
        setCategories(categoriesData)
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  // 直接使用后端返回的帖子列表，不进行前端筛选
  const displayPosts = posts
  const displayTotal = posts.length

  const handleSort = (field) => {
    // 计算新的排序顺序
    let newSortBy = field;
    let newSortOrder = 'desc';
    if (sortBy === field) {
      newSortOrder = sortOrder === 'desc' ? 'asc' : 'desc';
    }
    
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
    
    // 更新URL参数
    const newSearchParams = new URLSearchParams(window.location.search);
    newSearchParams.set('sortBy', newSortBy);
    newSearchParams.set('order', newSortOrder);
    newSearchParams.set('page', '1'); // 排序时重置到第一页
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
    
    // 调用后端API获取排序后的结果
    onPageChange(1, pageSize);
  }

  // 获取AI搜索建议
  const getSearchSuggestions = async (value) => {
    if (!value.trim()) {
      setSearchSuggestions([])
      return
    }

    try {
      setSearchLoading(true)
      const response = await aiAPI.enhancedSearch({
        query: value,
        category: selectedCategory
      })
      if (response.success && response.data) {
        setSearchSuggestions(response.data.suggestions || [])
      } else {
        setSearchSuggestions([])
      }
    } catch (error) {
      console.error('Failed to get search suggestions:', error)
      setSearchSuggestions([])
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSearch = (value) => {
    setKeyword(value)
    // 更新URL参数
    const newSearchParams = new URLSearchParams(window.location.search);
    if (value) {
      newSearchParams.set('keyword', value);
    } else {
      newSearchParams.delete('keyword');
    }
    newSearchParams.set('page', '1'); // 搜索时重置到第一页
    window.history.pushState({}, '', `?${newSearchParams.toString()}`);
    // 调用后端API获取搜索结果
    onPageChange(1, pageSize)
  }

  const handleSearchChange = (value) => {
    setKeyword(value)
    // 延迟获取搜索建议，减少API调用次数
    const timer = setTimeout(() => {
      getSearchSuggestions(value)
    }, 500)

    return () => clearTimeout(timer)
  }

  // 检查帖子收藏状态
  const checkFavoriteStatus = async (postId) => {
    if (!localStorage.getItem('token')) return false
    
    try {
      const response = await favoriteAPI.checkFavorite(postId)
      if (response.success) {
        setFavoritedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_favorited
        }))
        return response.data.is_favorited
      }
    } catch (error) {
      console.error('Failed to check favorite status:', error)
    }
    return false
  }

  // 处理收藏/取消收藏
  const handleToggleFavorite = async (postId) => {
    if (!localStorage.getItem('token')) {
      message.error('请先登录')
      return
    }
    
    if (favoritingPosts.has(postId)) return
    
    setFavoritingPosts(prev => new Set(prev).add(postId))
    try {
      const response = await favoriteAPI.toggleFavorite(postId)
      if (response.success) {
        setFavoritedPosts(prev => ({
          ...prev,
          [postId]: response.data.is_favorited
        }))
        message.success(response.data.is_favorited ? '收藏成功' : '取消收藏成功')
      }
    } catch (error) {
      console.error('Failed to toggle favorite:', error)
      message.error('操作失败，请重试')
    } finally {
      setFavoritingPosts(prev => {
        const newSet = new Set(prev)
        newSet.delete(postId)
        return newSet
      })
    }
  }

  // 当帖子列表变化时，检查每个帖子的收藏状态
  useEffect(() => {
    posts.forEach(post => {
      if (post.id && !(post.id in favoritedPosts)) {
        checkFavoriteStatus(post.id)
      }
    })
  }, [posts])

  const handleReset = () => {
    setKeyword('')
    setSelectedCategory(null)
    setSortBy('createdAt')
    setSortOrder('desc')
    form.resetFields()
  }

  return (
    <div>
      {/* 筛选和排序区域 */}
      <div style={{ 
        backgroundColor: 'white', 
        borderRadius: '12px', 
        padding: '24px', 
        marginBottom: '24px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #f0f0f0'
      }}>
        <Form form={form} layout="vertical">
          <Row gutter={[24, 16]} align="middle">
            {/* 关键词搜索 */}
            <Col xs={24} sm={12} md={8}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text strong style={{ marginBottom: 8, fontSize: '14px', color: '#262626' }}>智能搜索：</Text>
                <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '12px' }}>
                  <AutoComplete
                    options={searchSuggestions.map(suggestion => ({
                      label: suggestion,
                      value: suggestion
                    }))}
                    style={{ width: '100%', maxWidth: 300 }}
                    onSearch={handleSearch}
                    onSelect={handleSearch}
                    onChange={handleSearchChange}
                    loading={searchLoading}
                  >
                    <Input.Search
                      placeholder="请输入关键词（支持自然语言，如'如何办理校园卡'）"
                      allowClear
                      enterButton={<SearchOutlined />}
                      size="middle"
                      value={keyword}
                      style={{ 
                        width: '100%',
                        borderRadius: '8px',
                        border: '1px solid #d9d9d9',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                      }}
                    />
                  </AutoComplete>
                  <Tag 
                    color="#1890ff" 
                    icon={<BulbOutlined />} 
                    style={{ 
                      marginLeft: 8,
                      borderRadius: '6px',
                      padding: '4px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}
                  >
                    AI增强
                  </Tag>
                </div>
              </div>
            </Col>
            
            {/* 板块筛选 */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text strong style={{ marginBottom: 8, fontSize: '14px', color: '#262626' }}>板块筛选：</Text>
                <Select
                  placeholder="选择板块"
                  style={{ 
                    width: '100%', 
                    maxWidth: 200,
                    borderRadius: '8px',
                    border: '1px solid #d9d9d9'
                  }}
                  onChange={(value) => {
                    setSelectedCategory(value);
                    onCategoryChange(value);
                  }}
                  allowClear
                  value={selectedCategory}
                >
                  {categories.map(category => (
                    <Select.Option key={category.id} value={category.id}>
                      {category.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Col>
            
            {/* 排序方式 */}
            <Col xs={24} sm={12} md={6}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text strong style={{ marginBottom: 8, fontSize: '14px', color: '#262626' }}>排序方式：</Text>
                <Space size="middle" wrap>
                  <Button
                    type={sortBy === 'created_at' ? 'primary' : 'default'}
                    onClick={() => handleSort('created_at')}
                    icon={sortOrder === 'desc' && sortBy === 'created_at' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                    size="middle"
                    style={{
                      borderRadius: '6px',
                      padding: '0 16px',
                      fontWeight: 'bold'
                    }}
                  >
                    最新
                  </Button>
                  <Button
                    type={sortBy === 'likes_count' ? 'primary' : 'default'}
                    onClick={() => handleSort('likes_count')}
                    icon={sortOrder === 'desc' && sortBy === 'likes_count' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                    size="middle"
                    style={{
                      borderRadius: '6px',
                      padding: '0 16px',
                      fontWeight: 'bold'
                    }}
                  >
                    最热
                  </Button>
                  <Button
                    type={sortBy === 'comments_count' ? 'primary' : 'default'}
                    onClick={() => handleSort('comments_count')}
                    icon={sortOrder === 'desc' && sortBy === 'comments_count' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                    size="middle"
                    style={{
                      borderRadius: '6px',
                      padding: '0 16px',
                      fontWeight: 'bold'
                    }}
                  >
                    评论最多
                  </Button>
                </Space>
              </div>
            </Col>
            
            {/* 重置按钮 */}
            <Col xs={24} md={4} style={{ textAlign: 'right' }}>
              <Button 
                onClick={handleReset} 
                size="middle"
                style={{
                  borderRadius: '6px',
                  padding: '0 20px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: 'white'
                }}
              >
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </div>

      {/* 帖子列表 */}
      <div style={{ marginBottom: '24px' }}>
        {displayPosts.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '64px 24px',
            backgroundColor: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
            border: '1px solid #f0f0f0'
          }}>
            <div style={{ 
              fontSize: '48px', 
              marginBottom: '16px',
              color: '#f0f0f0'
            }}>📝</div>
            <Title level={4} style={{ margin: '0 0 8px 0', color: '#8c8c8c' }}>暂无帖子</Title>
            <Paragraph style={{ margin: 0, color: '#bfbfbf' }}>
              还没有相关帖子，快来发布第一个帖子吧！
            </Paragraph>
          </div>
        ) : (
          <List
            dataSource={displayPosts}
            renderItem={(post) => (
              <List.Item style={{ marginBottom: '16px', padding: 0 }}>
                <Card
                  hoverable
                  title={
                    <Link to={`/posts/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      <Space size="middle">
                        <EyeOutlined style={{ color: '#1890ff', fontSize: '18px' }} />
                        <Title level={4} style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: '#262626' }}>{post.title}</Title>
                        {post.is_sticky && <Tag color="red" style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>置顶</Tag>}
                        {post.is_essential && <Tag color="purple" style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>精华</Tag>}
                        {post.type === 'trade' && <Tag color="orange" style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>交易</Tag>}
                        {post.type === 'advertisement' && <Tag color="red" style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>广告</Tag>}
                        {post.type === 'anonymous' && <Tag color="gray" style={{ borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>匿名</Tag>}
                      </Space>
                    </Link>
                  }
                  extra={
                    <Tag 
                      color="#1890ff" 
                      style={{ 
                        borderRadius: '6px', 
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}
                    >
                      {post.category?.name}
                    </Tag>
                  }
                  style={{ 
                    borderRadius: '12px', 
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                    border: '1px solid #f0f0f0',
                    transition: 'all 0.3s ease'
                  }}
                  styles={{ body: { padding: '16px 24px 20px' } }}
                >
                  <Paragraph 
                    ellipsis={{ rows: 2 }} 
                    style={{ 
                      margin: 0, 
                      fontSize: '15px',
                      lineHeight: '1.7',
                      color: '#595959'
                    }}
                  >
                    {post.content}
                  </Paragraph>
                  
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #f0f0f0'
                  }}>
                    <Space>
                      <Avatar 
                        icon={<UserOutlined />} 
                        src={post.type === 'anonymous' ? null : post.user?.avatar} 
                        size={36} 
                        style={{
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
                        }}
                      />
                      <div>
                        <Text strong style={{ fontSize: '15px', color: '#262626' }}>
                          {post.type === 'anonymous' ? '匿名用户' : post.user?.username}
                        </Text>
                        <br />
                        <Text 
                          type="secondary" 
                          style={{ fontSize: '13px', color: '#bfbfbf' }}
                        >
                          {new Date(post.created_at).toLocaleString()}
                        </Text>
                      </div>
                    </Space>
                    
                    <Space size="middle" style={{ marginLeft: 'auto' }}>
                      <Space size="small">
                        <EyeOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: '14px', color: '#8c8c8c' }}>
                          {post.views_count}
                        </Text>
                      </Space>
                      <Space size="small">
                        <CommentOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: '14px', color: '#8c8c8c' }}>
                          {post.comments_count}
                        </Text>
                      </Space>
                      <Space size="small">
                        <LikeOutlined style={{ fontSize: '16px', color: '#8c8c8c' }} />
                        <Text type="secondary" style={{ fontSize: '14px', color: '#8c8c8c' }}>
                          {post.likes_count}
                        </Text>
                      </Space>
                      <Button 
                        type={favoritedPosts[post.id] ? "primary" : "default"} 
                        icon={<StarOutlined />}
                        size="middle"
                        loading={favoritingPosts.has(post.id)}
                        onClick={() => handleToggleFavorite(post.id)}
                        style={{ 
                          borderRadius: '6px',
                          padding: '0 16px',
                          height: '32px',
                          fontSize: '14px',
                          fontWeight: 'bold'
                        }}
                      >
                        {favoritedPosts[post.id] ? '已收藏' : '收藏'}
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </div>

      {/* 分页组件 */}
      {displayTotal > pageSize && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '32px',
          padding: '24px',
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
          border: '1px solid #f0f0f0'
        }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={displayTotal}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
            style={{ margin: 0 }}
          />
        </div>
      )}
    </div>
  )
}

export default PostList