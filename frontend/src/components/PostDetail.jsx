import React from 'react'
import { Card, Typography, Button } from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import { Link } from 'react-router-dom'

const { Title, Paragraph } = Typography

const PostDetail = () => {
  return (
    <Card
      title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={3} style={{ margin: 0 }}>如何高效准备期末考试？</Title>
          <Button 
            icon={<ArrowLeftOutlined />} 
            as={Link} 
            to="/"
          >
            返回列表
          </Button>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      <Paragraph style={{ margin: '24px 0' }}>
        马上就要期末考试了，大家有什么好的复习方法分享吗？
        
        我最近在准备期末考试，感觉时间不够用，有些课程还没有开始复习。希望大家能分享一些高效的复习方法，比如如何制定复习计划，如何高效记忆知识点，如何处理压力等等。
        
        谢谢大家！
      </Paragraph>
    </Card>
  )
}

export default PostDetail