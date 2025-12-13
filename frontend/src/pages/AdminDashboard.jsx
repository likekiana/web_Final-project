import React from 'react'
import { Layout, Menu, Typography } from 'antd'
import { UserOutlined, FileTextOutlined, TagOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons'
import { Routes, Route, Link, useLocation } from 'react-router-dom'

// 导入管理员子页面（后续创建）
import AdminHome from './admin/AdminHome'
import UserManagement from './admin/UserManagement'
import ContentManagement from './admin/ContentManagement'
import CategoryManagement from './admin/CategoryManagement'
import AdManagement from './admin/AdManagement'

const { Header, Content, Sider } = Layout
const { Title } = Typography

const AdminDashboard = () => {
  const location = useLocation()

  // 管理员菜单配置
  const adminMenuItems = [
    { key: '/admin', icon: <HomeOutlined />, label: <Link to="/admin">后台首页</Link> },
    { key: '/admin/users', icon: <UserOutlined />, label: <Link to="/admin/users">用户管理</Link> },
    { key: '/admin/content', icon: <FileTextOutlined />, label: <Link to="/admin/content">内容管理</Link> },
    { key: '/admin/categories', icon: <TagOutlined />, label: <Link to="/admin/categories">板块管理</Link> },
    { key: '/admin/ads', icon: <SettingOutlined />, label: <Link to="/admin/ads">广告管理</Link> }
  ]

  // 查找当前激活的菜单项
  const getActiveMenuKey = () => {
    const pathname = location.pathname
    return adminMenuItems.find(item => pathname.startsWith(item.key))?.key || '/admin'
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* 左侧菜单 */}
      <Sider width={200} theme="dark">
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#fff', 
          fontSize: 18, 
          fontWeight: 'bold'
        }}>
          管理员后台
        </div>
        <Menu
          mode="inline"
          selectedKeys={[getActiveMenuKey()]}
          items={adminMenuItems}
          style={{ height: '100%', borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        {/* 顶部导航 */}
        <Header style={{ background: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px' }}>
          <Title level={3} style={{ margin: 0 }}>
            校园信息聚合论坛系统 - 管理员后台
          </Title>
        </Header>
        
        {/* 主内容区域 */}
        <Content style={{ margin: '16px 24px 24px' }}>
          <div style={{ padding: 24, background: '#fff', borderRadius: 8, minHeight: 280 }}>
            <Routes>
              <Route path="" element={<AdminHome />} />
              <Route path="/users" element={<UserManagement />} />
              <Route path="/content" element={<ContentManagement />} />
              <Route path="/categories" element={<CategoryManagement />} />
              <Route path="/ads" element={<AdManagement />} />
            </Routes>
          </div>
        </Content>
      </Layout>
    </Layout>
  )
}

export default AdminDashboard