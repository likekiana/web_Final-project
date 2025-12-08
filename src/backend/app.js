// Express应用主入口文件
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sequelize, testConnection } = require('./config/database');
const config = require('./config/config');

// 初始化Express应用
const app = express();

// 配置中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 配置静态文件服务
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// 引入路由
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const likeRoutes = require('./routes/likeRoutes');
const adminRoutes = require('./routes/adminRoutes');

// 注册路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/likes', likeRoutes);
app.use('/api/admin', adminRoutes);

// 根路径路由
app.get('/', (req, res) => {
  res.json({
    message: '校园信息聚合论坛系统（校园通）API',
    version: '1.0.0',
    docs: '/api/docs'
  });
});

// 404路由
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 测试数据库连接
    await testConnection();
    
    // 同步数据库模型
    await sequelize.sync({ alter: true });
    console.log('数据库模型同步成功！');
    
    // 启动服务器
    const port = config.server.port;
    app.listen(port, () => {
      console.log(`服务器正在运行，访问地址: http://localhost:${port}`);
      console.log(`API文档地址: http://localhost:${port}/api/docs`);
    });
  } catch (error) {
    console.error('启动服务器失败:', error);
    process.exit(1);
  }
};

// 导出app实例
module.exports = app;

// 启动服务器（仅当直接运行此文件时）
if (require.main === module) {
  startServer();
}