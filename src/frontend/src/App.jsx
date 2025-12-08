import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { BookOutlined, HomeOutlined, ShoppingCartOutlined, TeamOutlined, BriefcaseOutlined, HeartOutlined, AnnouncementOutlined } from '@ant-design/icons'

const { Header, Content, Footer } = Layout
const { Title } = Typography

function App() {
  const menuItems = [
    { key: '1', icon: <BookOutlined />, label: '学习学术区' },
    { key: '2', icon: <HomeOutlined />, label: '校园生活区' },
    { key: '3', icon: <ShoppingCartOutlined />, label: '二手交易区' },
    { key: '4', icon: <TeamOutlined />, label: '活动社交区' },
    { key: '5', icon: <BriefcaseOutlined />, label: '实习就业区' },
    { key: '6', icon: <HeartOutlined />, label: '真情流露区' },
    { key: '7', icon: <AnnouncementOutlined />, label: '广告专区' }
  ]

  return (
    <Layout className="app-layout">
      <Header className="app-header">
        <Title level={2} className="app-title">校园信息聚合论坛系统</Title>
        <Menu
          theme="dark"
          mode="horizontal"
          items={menuItems}
          className="app-menu"
        />
      </Header>
      <Content className="app-content">
        <div className="app-container">
          <h1>欢迎使用校园通论坛</h1>
          <p>这是一个功能丰富的校园论坛系统，包含七大板块，满足您的各种需求。</p>
        </div>
      </Content>
      <Footer className="app-footer">
        校园信息聚合论坛系统（校园通）©{new Date().getFullYear()}
      </Footer>
    </Layout>
  )
}

export default App