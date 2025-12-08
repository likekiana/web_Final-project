// 评论路由
const express = require('express');
const router = express.Router();

// 获取评论列表
router.get('/', (req, res) => {
  // 获取评论列表逻辑待实现
  res.json({ message: '获取评论列表路由' });
});

// 更新评论
router.put('/:id', (req, res) => {
  // 更新评论逻辑待实现
  res.json({ message: '更新评论路由' });
});

// 删除评论
router.delete('/:id', (req, res) => {
  // 删除评论逻辑待实现
  res.json({ message: '删除评论路由' });
});

module.exports = router;