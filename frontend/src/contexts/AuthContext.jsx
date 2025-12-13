// 登录状态管理Context
import React, { createContext, useState, useEffect, useContext } from 'react'
import { authAPI } from '../services/api'

// 创建Context
const AuthContext = createContext()

// AuthProvider组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // 初始化检查登录状态
  useEffect(() => {
    const checkAuthStatus = async () => {
      setLoading(true)
      try {
        // 从localStorage获取token
        const token = localStorage.getItem('token')
        if (token) {
          // 调用API获取当前用户信息
          const response = await authAPI.getCurrentUser()
          if (response.success) {
            setUser(response.data)
            setIsAuthenticated(true)
          } else {
            localStorage.removeItem('token')
          }
        }
      } catch (error) {
        console.error('Failed to check auth status:', error)
        // 清除无效token
        localStorage.removeItem('token')
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [])

  // 登录
  const login = async (credentials) => {
    setLoading(true)
    try {
      const response = await authAPI.login(credentials)
      if (response.success) {
        // 保存token到localStorage
        localStorage.setItem('token', response.data?.token?.access)
        
        // 更新状态
        setUser(response.data?.user)
        setIsAuthenticated(true)
        
        return response
      } else {
        throw new Error(response.message || '登录失败')
      }
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 注册
  const register = async (userData) => {
    setLoading(true)
    try {
      const response = await authAPI.register(userData)
      return response
    } catch (error) {
      console.error('Register failed:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  // 退出登录
  const logout = () => {
    // 清除localStorage中的token
    localStorage.removeItem('token')
    
    // 更新状态
    setUser(null)
    setIsAuthenticated(false)
  }

  // 更新用户信息
  const updateUser = (userData) => {
    setUser(userData)
  }

  // Context值
  const contextValue = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

// 自定义Hook，方便组件使用AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
