import React from 'react'
import { Layout, Menu, Button, Space } from 'antd'
import { 
  BookOutlined, HomeOutlined, ShoppingCartOutlined, TeamOutlined, 
  HeartOutlined, LoginOutlined, UserAddOutlined, HomeTwoTone, 
  BellOutlined, FileTextOutlined, UserOutlined 
} from '@ant-design/icons'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'

// 导入页面组件
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreatePost from './pages/CreatePost'
import PostDetailPage from './pages/PostDetailPage'
import AdminDashboard from './pages/AdminDashboard'
import Profile from './pages/Profile'
import EditPost from './pages/EditPost'

// 导入配置
import categories from './config/categories'

const { Header, Content, Footer } = Layout

// 导航栏组件
const AppHeader = () => {
  const location = useLocation()
  const navigate = useNavigate()

  // 图标映射
  const iconMap = {
    BookOutlined: <BookOutlined />,
    HomeOutlined: <HomeOutlined />,
    ShoppingCartOutlined: <ShoppingCartOutlined />,
    TeamOutlined: <TeamOutlined />,
    FileTextOutlined: <FileTextOutlined />,
    HeartOutlined: <HeartOutlined />,
    BellOutlined: <BellOutlined />
  }

  // 生成导航栏菜单项
  const menuItems = [
    { key: 'home', icon: <HomeTwoTone />, label: <Link to="/">首页</Link> },
    ...categories.map(category => ({
      key: category.id.toString(),
      icon: iconMap[category.icon],
      label: <Link to={`/?category=${category.id}`}>{category.name}</Link>
    }))
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
            <Button type="link" icon={<UserOutlined />} onClick={() => navigate('/profile')} style={{ color: '#fff' }}>
              个人中心
            </Button>
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
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/posts/create" element={<CreatePost />} />
              <Route path="/posts/:id" element={<PostDetailPage />} />
              <Route path="/posts/:id/edit" element={<EditPost />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin/*" element={<AdminDashboard />} />
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