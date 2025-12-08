// 点赞模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
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
  targetType: {
    type: DataTypes.ENUM('post', 'comment'),
    allowNull: false
  },
  targetId: {
    type: DataTypes.BIGINT,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'likes',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['userId', 'targetType', 'targetId'] },
    { fields: ['targetType', 'targetId'] },
    { fields: ['userId'] }
  ]
});

// 关联关系
Like.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = Like;