// 全局配置文件
module.exports = {
  // 服务器配置
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  // JWT配置
  jwt: {
    secret: process.env.JWT_SECRET || 'campus_forum_secret_key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  // 文件上传配置
  upload: {
    dest: process.env.UPLOAD_DIR || 'uploads',
    maxSize: process.env.UPLOAD_MAX_SIZE || 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  },
  // 邮箱验证配置
  email: {
    regex: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    schoolDomain: process.env.SCHOOL_DOMAIN || 'xx.edu.cn'
  },
  // 分页配置
  pagination: {
    defaultPageSize: 10,
    maxPageSize: 50
  }
};