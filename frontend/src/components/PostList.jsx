import React, { useState } from 'react'
import { Card, List, Typography, Avatar, Button, Tag, Space, Pagination, Select, Row, Col, Input, Form } from 'antd'
import { LikeOutlined, CommentOutlined, EyeOutlined, ArrowUpOutlined, ArrowDownOutlined, SearchOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Paragraph, Text } = Typography
const { Option } = Select
const { Search } = Input

const PostList = ({ posts = [], total = 0, page = 1, pageSize = 10, onPageChange }) => {
  const [sortBy, setSortBy] = useState('createdAt')
  const [sortOrder, setSortOrder] = useState('desc')
  const [selectedCategory, setSelectedCategory] = useState(null)
  const [keyword, setKeyword] = useState('')
  const [form] = Form.useForm()

  // 模拟帖子数据
  const mockPosts = [
    {
      id: 1,
      title: '如何高效准备期末考试？',
      content: '马上就要期末考试了，大家有什么好的复习方法分享吗？',
      categoryId: 1,
      categoryName: '学习学术区',
      userId: 1,
      username: 'testuser',
      avatar: null,
      likesCount: 15,
      commentsCount: 8,
      viewsCount: 120,
      createdAt: '2023-12-10T15:30:00Z',
      type: 'normal'
    },
    {
      id: 2,
      title: '出售二手笔记本电脑',
      content: '出售一台使用一年的笔记本电脑，配置如下：...',
      categoryId: 3,
      categoryName: '二手交易区',
      userId: 2,
      username: 'user2',
      avatar: null,
      likesCount: 5,
      commentsCount: 3,
      viewsCount: 80,
      createdAt: '2023-12-09T10:20:00Z',
      type: 'trade'
    },
    {
      id: 3,
      title: '社团招新啦！',
      content: '我们社团开始招新了，欢迎大家加入！',
      categoryId: 4,
      categoryName: '活动社交区',
      userId: 3,
      username: 'user3',
      avatar: null,
      likesCount: 20,
      commentsCount: 12,
      viewsCount: 150,
      createdAt: '2023-12-08T14:45:00Z',
      type: 'normal'
    },
    {
      id: 4,
      title: '寻找丢失的校园卡',
      content: '今天下午在图书馆丢失了校园卡，有捡到的同学请联系我，非常感谢！',
      categoryId: 2,
      categoryName: '校园生活区',
      userId: 4,
      username: 'user4',
      avatar: null,
      likesCount: 3,
      commentsCount: 5,
      viewsCount: 60,
      createdAt: '2023-12-07T10:15:00Z',
      type: 'normal'
    },
    {
      id: 5,
      title: '2024届毕业生求职经验分享会',
      content: '我们将举办一场求职经验分享会，邀请已拿到offer的学长学姐分享经验，欢迎大家参加！',
      categoryId: 5,
      categoryName: '实习就业区',
      userId: 5,
      username: 'user5',
      avatar: null,
      likesCount: 12,
      commentsCount: 7,
      viewsCount: 90,
      createdAt: '2023-12-06T14:00:00Z',
      type: 'normal'
    }
  ]

  // 筛选和搜索帖子
  const filterAndSearchPosts = (postsToFilter) => {
    let filtered = [...postsToFilter]

    // 关键词搜索
    if (keyword.trim()) {
      const searchKeyword = keyword.toLowerCase().trim()
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchKeyword) || 
        post.content.toLowerCase().includes(searchKeyword)
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

      // 字符串类型特殊处理
      if (typeof aValue === 'string') {
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

  const displayPosts = filterAndSearchPosts(posts.length > 0 ? posts : mockPosts)
  const displayTotal = displayPosts.length

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
                <Option value={1}>学习学术区</Option>
                <Option value={2}>校园生活区</Option>
                <Option value={3}>二手交易区</Option>
                <Option value={4}>活动社交区</Option>
                <Option value={5}>实习就业区</Option>
                <Option value={6}>真情流露区</Option>
                <Option value={7}>广告专区</Option>
              </Select>
            </Col>
            
            {/* 排序方式 */}
            <Col xs={24} sm={12} md={6}>
              <Text strong>排序方式：</Text>
              <Space size="middle" style={{ marginLeft: 8 }}>
                <Button
                  type={sortBy === 'createdAt' ? 'primary' : 'default'}
                  onClick={() => handleSort('createdAt')}
                  icon={sortOrder === 'desc' && sortBy === 'createdAt' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                >
                  最新
                </Button>
                <Button
                  type={sortBy === 'likesCount' ? 'primary' : 'default'}
                  onClick={() => handleSort('likesCount')}
                  icon={sortOrder === 'desc' && sortBy === 'likesCount' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
                >
                  最热
                </Button>
                <Button
                  type={sortBy === 'commentsCount' ? 'primary' : 'default'}
                  onClick={() => handleSort('commentsCount')}
                  icon={sortOrder === 'desc' && sortBy === 'commentsCount' ? <ArrowDownOutlined /> : <ArrowUpOutlined />}
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
                    <Text type="secondary">{post.viewsCount}</Text>
                  </Space>
                  <Space>
                    <CommentOutlined />
                    <Text type="secondary">{post.commentsCount}</Text>
                  </Space>
                  <Space>
                    <LikeOutlined />
                    <Text type="secondary">{post.likesCount}</Text>
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