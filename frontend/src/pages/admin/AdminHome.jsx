import React from 'react'
import { Card, Row, Col, Statistic, Typography } from 'antd'
import { UserOutlined, FileTextOutlined, TagOutlined, SettingOutlined } from '@ant-design/icons'

const { Title } = Typography

const AdminHome = () => {
  // 模拟统计数据
  const stats = [
    { title: '总用户数', value: 1000, icon: <UserOutlined />, color: '#1890ff' },
    { title: '总帖子数', value: 5000, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '总板块数', value: 7, icon: <TagOutlined />, color: '#faad14' },
    { title: '总广告数', value: 100, icon: <SettingOutlined />, color: '#f5222d' }
  ]

  return (
    <div>
      <Title level={2}>欢迎来到管理员后台</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable>
              <Statistic
                title={stat.title}
                value={stat.value}
                prefix={stat.icon}
                valueStyle={{ color: stat.color }}
              />
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近动态" hoverable>
            <div style={{ padding: 16 }}>
              <p>• 用户 testuser 发布了新帖子</p>
              <p>• 用户 user2 被管理员封禁</p>
              <p>• 新增板块 "广告专区"</p>
              <p>• 管理员删除了违规帖子</p>
              <p>• 用户 user3 更新了个人资料</p>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="待处理事项" hoverable>
            <div style={{ padding: 16 }}>
              <p>• 待审核帖子：3</p>
              <p>• 待处理举报：5</p>
              <p>• 待审核广告：2</p>
              <p>• 待处理用户申诉：1</p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome