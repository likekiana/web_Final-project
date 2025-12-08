// 用户路由
const express = require('express');
const router = express.Router();

// 获取用户信息
router.get('/:id', (req, res) => {
  // 获取用户信息逻辑待实现
  res.json({ message: '获取用户信息路由' });
});

// 更新用户信息
router.put('/:id', (req, res) => {
  // 更新用户信息逻辑待实现
  res.json({ message: '更新用户信息路由' });
});

// 获取用户发帖历史
router.get('/:id/posts', (req, res) => {
  // 获取用户发帖历史逻辑待实现
  res.json({ message: '获取用户发帖历史路由' });
});

module.exports = router;