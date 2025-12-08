// 评论模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Post = require('./post');

const Comment = sequelize.define('Comment', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  postId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Post,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  status: {
    type: DataTypes.ENUM('normal', 'deleted', 'reported'),
    allowNull: false,
    defaultValue: 'normal'
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
}, {
  tableName: 'comments',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['postId'] },
    { fields: ['createdAt'] }
  ]
});

// 关联关系
Comment.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Comment.belongsTo(Post, { foreignKey: 'postId', as: 'post' });
User.hasMany(Comment, { foreignKey: 'userId', as: 'comments' });
Post.hasMany(Comment, { foreignKey: 'postId', as: 'comments' });

module.exports = Comment;