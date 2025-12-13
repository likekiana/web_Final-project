import React, { useState, useEffect } from 'react'
import { Card, List, Typography, Avatar, Button, Tag, Space, Pagination, Select, Row, Col, Input, Form } from 'antd'
import { LikeOutlined, CommentOutlined, EyeOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

// 导入API服务
import { categoryAPI } from '../services/api'

const { Title, Paragraph, Text } = Typography
const { Option } = Select
const { Search } = Input

const PostList = ({ posts = [], total = 0, page = 1, pageSize = 10, onPageChange, category = null }) => {
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedCategory, setSelectedCategory] = useState(category)
  const [keyword, setKeyword] = useState('')
  const [form] = Form.useForm()
  const [categories, setCategories] = useState([])

  // 当category属性变化时，更新selectedCategory状态
  useEffect(() => {
    setSelectedCategory(category)
  }, [category])

  // 从API获取板块数据
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryAPI.getCategories()
        setCategories(response.data || [])
      } catch (error) {
        console.error('Failed to fetch categories:', error)
        setCategories([])
      }
    }

    fetchCategories()
  }, [])

  // 筛选和搜索帖子
  const filterAndSearchPosts = (postsToFilter) => {
    // 确保postsToFilter是数组
    const safePosts = Array.isArray(postsToFilter) ? postsToFilter : []
    let filtered = [...safePosts]

    // 关键词搜索
    if (keyword.trim()) {
      const searchKeyword = keyword.toLowerCase().trim()
      filtered = filtered.filter(post => 
        post.title?.toLowerCase().includes(searchKeyword) || 
        post.content?.toLowerCase().includes(searchKeyword)
      )
    }

    // 板块筛选
    if (selectedCategory) {
      filtered = filtered.filter(post => post.categoryId === selectedCategory)
    }

    // 排序
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      // 确保值存在
      if (aValue === undefined || aValue === null) return sortOrder === 'asc' ? 1 : -1
      if (bValue === undefined || bValue === null) return sortOrder === 'asc' ? -1 : 1

      // 字符串类型特殊处理
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue)
      }

      // 数字类型比较
      return sortOrder === 'asc' 
        ? aValue - bValue 
        : bValue - aValue
    })

    return filtered
  }

  const displayPosts = filterAndSearchPosts(posts)
  const displayTotal = posts.length

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
    } else {
      setSortBy(field)
      setSortOrder('desc')
    }
  }

  const handleSearch = (value) => {
    setKeyword(value)
  }

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
      <Card style={{ marginBottom: 16 }}>
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]} align="middle">
            {/* 关键词搜索 */}
            <Col xs={24} sm={12} md={8}>
              <Text strong>关键词搜索：</Text>
              <Search
                placeholder="请输入关键词"
                allowClear
                enterButton={<SearchOutlined />}
                size="middle"
                onSearch={handleSearch}
                onChange={(e) => setKeyword(e.target.value)}
                value={keyword}
                style={{ width: 300, marginLeft: 8 }}
              />
            </Col>
            
            {/* 板块筛选 */}
              <Col xs={24} sm={12} md={6}>
                <Text strong>板块筛选：</Text>
                <Select
                  placeholder="选择板块"
                  style={{ width: 200, marginLeft: 8 }}
                  onChange={setSelectedCategory}
                  allowClear
                  value={selectedCategory}
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>
                      {category.name}
                    </Option>
                  ))}
                </Select>
              </Col>
            
            {/* 排序方式 */}
            <Col xs={24} sm={12} md={6}>
              <Text strong>排序方式：</Text>
              <Space size="middle" style={{ marginLeft: 8 }}>
                <Button
                  type={sortBy === 'created_at' ? 'primary' : 'default'}
                  onClick={() => handleSort('created_at')}
                  icon={sortOrder === 'desc' && sortBy === 'created_at' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                >
                  最新
                </Button>
                <Button
                  type={sortBy === 'likes_count' ? 'primary' : 'default'}
                  onClick={() => handleSort('likes_count')}
                  icon={sortOrder === 'desc' && sortBy === 'likes_count' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                >
                  最热
                </Button>
                <Button
                  type={sortBy === 'comment_count' ? 'primary' : 'default'}
                  onClick={() => handleSort('comment_count')}
                  icon={sortOrder === 'desc' && sortBy === 'comment_count' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                >
                  评论最多
                </Button>
              </Space>
            </Col>
            
            {/* 重置按钮 */}
            <Col xs={24} style={{ textAlign: 'right' }}>
              <Button onClick={handleReset} style={{ marginRight: 8 }}>
                重置
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 帖子列表 */}
      <List
        grid={{ gutter: 16, xs: 1, sm: 1, md: 1, lg: 1 }}
        dataSource={displayPosts}
        renderItem={(post) => (
          <List.Item>
            <Card
              hoverable
              title={
                <Link to={`/posts/${post.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <Space>
                    <Title level={4} style={{ margin: 0 }}>{post.title}</Title>
                    {post.type === 'trade' && <Tag color="orange">交易</Tag>}
                    {post.type === 'advertisement' && <Tag color="red">广告</Tag>}
                  </Space>
                </Link>
              }
              extra={
                <Tag color="blue">{post.categoryName}</Tag>
              }
              style={{ marginBottom: 16 }}
            >
              <Paragraph ellipsis={{ rows: 2 }}>
                {post.content}
              </Paragraph>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                <Space>
                  <Avatar icon={<UserOutlined />} src={post.avatar} size={32} />
                  <div>
                    <Text strong>{post.username}</Text>
                    <br />
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {new Date(post.createdAt).toLocaleString()}
                    </Text>
                  </div>
                </Space>
                
                <Space size="middle" style={{ marginLeft: 'auto' }}>
                  <Space>
                    <EyeOutlined />
                    <Text type="secondary">{post.views_count}</Text>
                  </Space>
                  <Space>
                    <CommentOutlined />
                    <Text type="secondary">{post.comment_count}</Text>
                  </Space>
                  <Space>
                    <LikeOutlined />
                    <Text type="secondary">{post.likes_count}</Text>
                  </Space>
                </Space>
              </div>
            </Card>
          </List.Item>
        )}
      />

      {/* 分页组件 */}
      {displayTotal > pageSize && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Pagination
            current={page}
            pageSize={pageSize}
            total={displayTotal}
            onChange={onPageChange}
            showSizeChanger
            pageSizeOptions={['10', '20', '50']}
          />
        </div>
      )}
    </div>
  )
}

export default PostList