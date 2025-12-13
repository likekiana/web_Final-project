import React from 'react'
import { Layout, Menu, Button, Space } from 'antd'
import { BookOutlined, HomeOutlined, ShoppingCartOutlined, TeamOutlined, HeartOutlined, LoginOutlined, UserAddOutlined, HomeTwoTone, BellOutlined, FileTextOutlined } from '@ant-design/icons'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

// 导入页面组件
import Home from './pages/Home'

const { Header, Content, Footer } = Layout

// 导航栏组件
const AppHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const menuItems = [
    { key: 'home', icon: <HomeTwoTone />, label: <Link to="/">首页</Link> },
    { key: '1', icon: <BookOutlined />, label: '学习学术区' },
    { key: '2', icon: <HomeOutlined />, label: '校园生活区' },
    { key: '3', icon: <ShoppingCartOutlined />, label: '二手交易区' },
    { key: '4', icon: <TeamOutlined />, label: '活动社交区' },
    { key: '5', icon: <FileTextOutlined />, label: '实习就业区' },
    { key: '6', icon: <HeartOutlined />, label: '真情流露区' },
    { key: '7', icon: <BellOutlined />, label: '广告专区' }
  ]

  // 只有在非登录/注册页面显示完整导航栏
  const showFullNav = !['/login', '/register'].includes(location.pathname)

  return (
    <Header className="app-header">
      {showFullNav ? (
        <>
          <Link to="/" style={{ textDecoration: 'none' }}>
            <h1 className="app-title" style={{ margin: 0, color: '#fff', fontSize: 20 }}>
              校园信息聚合论坛系统
            </h1>
          </Link>
          <Menu
            theme="dark"
            mode="horizontal"
            items={menuItems}
            className="app-menu"
          />
          <Space>
            <Button type="link" icon={<LoginOutlined />} onClick={() => navigate('/login')} style={{ color: '#fff' }}>
              登录
            </Button>
            <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        </>
      ) : (
        <Link to="/" style={{ textDecoration: 'none' }}>
          <h1 className="app-title" style={{ margin: 0, color: '#fff', fontSize: 20 }}>
            校园信息聚合论坛系统
          </h1>
        </Link>
      )}
    </Header>
  )
}

function App() {
  return (
    <Router>
      <Layout className="app-layout">
        <AppHeader />
        <Content className="app-content">
          <div className="app-container">
            <Routes>
              <Route path="/" element={<Home />} />
            </Routes>
          </div>
        </Content>
        <Footer className="app-footer">
          校园信息聚合论坛系统（校园通）©{new Date().getFullYear()}
        </Footer>
      </Layout>
    </Router>
  )
}

export default App