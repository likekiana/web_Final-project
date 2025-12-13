// API服务文件，封装axios请求
import axios from 'axios'

// 创建axios实例
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api', // 使用Vite环境变量配置API地址
  timeout: 10000, // 请求超时时间
  headers: {
    'Content-Type': 'application/json'
  }
})

// 请求拦截器
api.interceptors.request.use(
  config => {
    // 从localStorage获取token
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    // 处理请求错误
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  response => {
    // 直接返回响应数据
    return response.data
  },
  error => {
    // 处理响应错误
    console.error('Response error:', error)
    
    // 统一处理错误信息
    let errorMessage = '请求失败，请重试'
    if (error.response) {
      // 服务器返回错误状态码
      switch (error.response.status) {
        case 400:
          errorMessage = error.response.data.message || '请求参数错误'
          break
        case 401:
          errorMessage = '未授权，请重新登录'
          // 清除本地token，跳转到登录页
          localStorage.removeItem('token')
          window.location.href = '/login'
          break
        case 403:
          errorMessage = '拒绝访问'
          break
        case 404:
          errorMessage = '请求的资源不存在'
          break
        case 500:
          errorMessage = '服务器内部错误'
          break
        default:
          errorMessage = error.response.data.message || `请求失败，状态码：${error.response.status}`
      }
    } else if (error.request) {
      // 请求已发送，但没有收到响应
      errorMessage = '网络错误，请检查网络连接'
    }
    
    // 打印错误信息到控制台
    console.error('API Error:', errorMessage)
    
    return Promise.reject(error)
  }
)

// 认证相关API
export const authAPI = {
  // 登录
  login: (data) => api.post('/auth/login', data),
  // 注册
  register: (data) => api.post('/auth/register', data),
  // 获取当前用户信息
  getCurrentUser: () => api.get('/auth/me')
}

// 帖子相关API
export const postAPI = {
  // 获取帖子列表
  getPosts: (params) => api.get('/posts/', { params }),
  // 获取帖子详情
  getPostDetail: (id) => api.get(`/posts/${id}/`),
  // 创建帖子
  createPost: (data) => api.post('/posts/', data),
  // 更新帖子
  updatePost: (id, data) => api.put(`/posts/${id}/`, data),
  // 删除帖子
  deletePost: (id) => api.delete(`/posts/${id}/`),
  // 点赞帖子
  likePost: (id) => api.post(`/posts/${id}/like/`),
  // 取消点赞帖子
  unlikePost: (id) => api.delete(`/posts/${id}/like/`)
}

// 评论相关API
export const commentAPI = {
  // 获取评论列表
  getComments: (postId, params) => api.get(`/posts/${postId}/comments/`, { params }),
  // 创建评论
  createComment: (postId, data) => api.post(`/posts/${postId}/comments/create/`, data),
  // 删除评论
  deleteComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}/`),
  // 点赞评论
  likeComment: (postId, commentId) => api.post(`/posts/${postId}/comments/${commentId}/like/`),
  // 取消点赞评论
  unlikeComment: (postId, commentId) => api.delete(`/posts/${postId}/comments/${commentId}/like/`)
}

// 板块相关API
export const categoryAPI = {
  // 获取板块列表
  getCategories: () => api.get('/categories/')
}

// 用户相关API
export const userAPI = {
  // 获取用户信息
  getUserInfo: (id) => api.get(`/users/${id}`),
  // 更新用户信息
  updateUserInfo: (id, data) => api.put(`/users/${id}`, data),
  // 获取用户帖子列表
  getUserPosts: (id, params) => api.get(`/users/${id}/posts`, { params })
}

// 管理员相关API
export const adminAPI = {
  // 用户管理
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUserRole: (id, data) => api.put(`/admin/users/${id}/role`, data),
  banUser: (id) => api.put(`/admin/users/${id}/ban`),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  
  // 内容管理
  getPosts: (params) => api.get('/admin/posts', { params }),
  deletePost: (id) => api.delete(`/admin/posts/${id}`),
  pinPost: (id) => api.put(`/admin/posts/${id}/pin`),
  unpinPost: (id) => api.put(`/admin/posts/${id}/unpin`),
  
  // 板块管理
  getCategories: (params) => api.get('/admin/categories', { params }),
  createCategory: (data) => api.post('/admin/categories', data),
  updateCategory: (id, data) => api.put(`/admin/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/admin/categories/${id}`),
  
  // 广告管理
  getAds: (params) => api.get('/admin/ads', { params }),
  approveAd: (id) => api.put(`/admin/ads/${id}/approve`),
  rejectAd: (id) => api.put(`/admin/ads/${id}/reject`),
  deleteAd: (id) => api.delete(`/admin/ads/${id}`)
}

export default api
