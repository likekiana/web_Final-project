// 帖子模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');
const Category = require('./category');

const Post = sequelize.define('Post', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('normal', 'trade', 'advertisement'),
    allowNull: false,
    defaultValue: 'normal'
  },
  images: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: []
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
  categoryId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    references: {
      model: Category,
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  likesCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  commentsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  viewsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  isSticky: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  isEssential: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
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
  tableName: 'posts',
  timestamps: true,
  indexes: [
    { fields: ['userId'] },
    { fields: ['categoryId'] },
    { fields: ['type'] },
    { fields: ['createdAt'] },
    { fields: ['isSticky'] },
    { fields: ['isEssential'] },
    { fulltext: true, fields: ['title', 'content'] }
  ]
});

// 关联关系
Post.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Post.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
User.hasMany(Post, { foreignKey: 'userId', as: 'posts' });
Category.hasMany(Post, { foreignKey: 'categoryId', as: 'posts' });

module.exports = Post;