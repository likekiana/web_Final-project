// 举报模型
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const User = require('./user');

const Report = sequelize.define('Report', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true
  },
  type: {
    type: DataTypes.ENUM('spam', 'pornography', 'violence', 'other'),
    allowNull: false
  },
  reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  reporterId: {
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
  status: {
    type: DataTypes.ENUM('pending', 'processed'),
    allowNull: false,
    defaultValue: 'pending'
  },
  action: {
    type: DataTypes.ENUM('ignore', 'delete', 'warn'),
    allowNull: true
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  processedBy: {
    type: DataTypes.BIGINT,
    allowNull: true,
    references: {
      model: User,
      key: 'id'
    },
    onDelete: 'SET NULL'
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
  tableName: 'reports',
  timestamps: true,
  indexes: [
    { fields: ['reporterId'] },
    { fields: ['targetType', 'targetId'] },
    { fields: ['status'] },
    { fields: ['type'] }
  ]
});

// 关联关系
Report.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Report.belongsTo(User, { foreignKey: 'processedBy', as: 'processor' });

module.exports = Report;