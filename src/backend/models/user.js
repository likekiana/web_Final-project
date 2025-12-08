// 用户模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      len: [2, 50]
    }
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  avatar: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  role: {
    type: DataTypes.ENUM('student', 'merchant', 'moderator', 'admin', 'superAdmin'),
    allowNull: false,
    defaultValue: 'student'
  },
  status: {
    type: DataTypes.ENUM('active', 'banned'),
    allowNull: false,
    defaultValue: 'active'
  },
  reputation: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 100
  },
  postCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  commentCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
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
  tableName: 'users',
  timestamps: true,
  indexes: [
    { unique: true, fields: ['email'] },
    { unique: true, fields: ['username'] },
    { fields: ['role'] },
    { fields: ['status'] }
  ]
});

module.exports = User;