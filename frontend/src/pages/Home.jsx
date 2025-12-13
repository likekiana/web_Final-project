import React from 'react'
import { Typography, Row, Col, Button } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const Home = () => {
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
      
      <div style={{ textAlign: 'center', padding: '40px 0', background: '#f0f2f5', borderRadius: '8px' }}>
        <Title level={3}>帖子列表</Title>
        <Paragraph>帖子列表组件将显示在这里</Paragraph>
      </div>
    </div>
  )
}

export default Home