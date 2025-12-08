// 模型索引文件，统一导出所有模型
const User = require('./user');
const Category = require('./category');
const Post = require('./post');
const Comment = require('./comment');
const Like = require('./like');
const Report = require('./report');

// 导出所有模型
module.exports = {
  User,
  Category,
  Post,
  Comment,
  Like,
  Report
};