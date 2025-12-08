// 认证路由
const express = require('express');
const router = express.Router();

// 注册路由
router.post('/register', (req, res) => {
  // 注册逻辑待实现
  res.json({ message: '注册路由' });
});

// 登录路由
router.post('/login', (req, res) => {
  // 登录逻辑待实现
  res.json({ message: '登录路由' });
});

// 获取当前用户信息
router.get('/me', (req, res) => {
  // 获取当前用户信息逻辑待实现
  res.json({ message: '获取当前用户信息路由' });
});

module.exports = router;