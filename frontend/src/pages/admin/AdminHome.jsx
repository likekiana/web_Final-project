import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, Typography, Spin } from 'antd'
import { UserOutlined, FileTextOutlined, TagOutlined, SettingOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'

const { Title } = Typography

const AdminHome = () => {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState([
    { title: '总用户数', value: 0, icon: <UserOutlined />, color: '#1890ff' },
    { title: '总帖子数', value: 0, icon: <FileTextOutlined />, color: '#52c41a' },
    { title: '总板块数', value: 0, icon: <TagOutlined />, color: '#faad14' },
    { title: '总广告数', value: 0, icon: <SettingOutlined />, color: '#f5222d' }
  ])
  const [pendingItems, setPendingItems] = useState([])
  const [recentActivities, setRecentActivities] = useState([])

  // 从API获取统计数据
  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      try {
        const response = await adminAPI.getDashboardStats()
        if (response.success) {
          const data = response.data
          
          // 更新统计数据
          setStats([
            { title: '总用户数', value: data.stats.total_users, icon: <UserOutlined />, color: '#1890ff' },
            { title: '总帖子数', value: data.stats.total_posts, icon: <FileTextOutlined />, color: '#52c41a' },
            { title: '总板块数', value: data.stats.total_categories, icon: <TagOutlined />, color: '#faad14' },
            { title: '总广告数', value: data.stats.total_ads, icon: <SettingOutlined />, color: '#f5222d' }
          ])
          
          // 更新待处理事项
          setPendingItems([
            { title: '待审核帖子', value: data.pending_items.pending_posts },
            { title: '待处理举报', value: data.pending_items.pending_reports },
            { title: '待审核广告', value: data.pending_items.pending_ads }
          ])
          
          // 更新最近动态
          setRecentActivities(data.recent_activities)
        }
      } catch (error) {
        console.error('获取统计数据失败:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div>
      <Title level={2}>欢迎来到管理员后台</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {stats.map((stat, index) => (
          <Col xs={24} sm={12} md={6} key={index}>
            <Card hoverable>
              <Spin spinning={loading}>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.icon}
                  valueStyle={{ color: stat.color }}
                />
              </Spin>
            </Card>
          </Col>
        ))}
      </Row>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="最近动态" hoverable>
            <Spin spinning={loading}>
              <div style={{ padding: 16 }}>
                {recentActivities.length > 0 ? (
                  recentActivities.map((activity, index) => (
                    <p key={index}>• {activity}</p>
                  ))
                ) : (
                  <p>暂无最近动态</p>
                )}
              </div>
            </Spin>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title="待处理事项" hoverable>
            <Spin spinning={loading}>
              <div style={{ padding: 16 }}>
                {pendingItems.map((item, index) => (
                  <p key={index}>• {item.title}：{item.value}</p>
                ))}
              </div>
            </Spin>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminHome