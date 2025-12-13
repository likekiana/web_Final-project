import React, { useState } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'

const { Title } = Typography
const { Search } = Input
const { Option } = Select

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  // 模拟用户数据
  const mockUsers = [
    { id: 1, username: 'testuser', email: 'test@example.edu.cn', role: 'student', status: 'active', reputation: 100, postCount: 5, createdAt: '2023-01-01' },
    { id: 2, username: 'user2', email: 'user2@example.edu.cn', role: 'student', status: 'banned', reputation: 50, postCount: 3, createdAt: '2023-02-01' },
    { id: 3, username: 'user3', email: 'user3@example.edu.cn', role: 'moderator', status: 'active', reputation: 200, postCount: 20, createdAt: '2023-03-01' },
    { id: 4, username: 'user4', email: 'user4@example.edu.cn', role: 'merchant', status: 'active', reputation: 150, postCount: 10, createdAt: '2023-04-01' },
    { id: 5, username: 'user5', email: 'user5@example.edu.cn', role: 'admin', status: 'active', reputation: 300, postCount: 30, createdAt: '2023-05-01' }
  ]

  // 筛选用户
  const filteredUsers = mockUsers.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchText.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchText.toLowerCase())
    const matchesRole = !userRole || user.role === userRole
    const matchesStatus = !userStatus || user.status === userStatus
    return matchesSearch && matchesRole && matchesStatus
  })

  // 用户状态标签配置
  const getUserStatusTag = (status) => {
    switch (status) {
      case 'active':
        return <Tag color="green">活跃</Tag>
      case 'banned':
        return <Tag color="red">封禁</Tag>
      case 'pending':
        return <Tag color="orange">待审核</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 用户角色标签配置
  const getUserRoleTag = (role) => {
    switch (role) {
      case 'student':
        return <Tag color="blue">学生</Tag>
      case 'merchant':
        return <Tag color="purple">商户</Tag>
      case 'moderator':
        return <Tag color="cyan">版主</Tag>
      case 'admin':
        return <Tag color="magenta">管理员</Tag>
      case 'superAdmin':
        return <Tag color="gold">超级管理员</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 表格列配置
  const columns = [
    {
      title: '用户ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <UserOutlined />
          {text}
        </Space>
      )
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email'
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      render: (text) => getUserRoleTag(text)
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getUserStatusTag(text)
    },
    {
      title: '信誉值',
      dataIndex: 'reputation',
      key: 'reputation'
    },
    {
      title: '发帖数',
      dataIndex: 'postCount',
      key: 'postCount'
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      )
    }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  const handleEdit = (user) => {
    setSelectedUser(user)
    setIsModalVisible(true)
  }

  const handleDelete = (userId) => {
    Modal.confirm({
      title: '确认删除',
      content: '确定要删除这个用户吗？',
      okText: '确定',
      okType: 'danger',
      cancelText: '取消',
      onOk: () => {
        message.success('用户删除成功')
        // 这里可以添加删除用户的逻辑
      }
    })
  }

  const handleModalOk = () => {
    setIsModalVisible(false)
    message.success('用户信息更新成功')
    // 这里可以添加更新用户信息的逻辑
  }

  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSelectedUser(null)
  }

  return (
    <div>
      <Title level={2}>用户管理</Title>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索用户名或邮箱"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={handleSearch}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="选择角色"
            allowClear
            size="middle"
            onChange={setUserRole}
            style={{ width: 150 }}
          >
            <Option value="student">学生</Option>
            <Option value="merchant">商户</Option>
            <Option value="moderator">版主</Option>
            <Option value="admin">管理员</Option>
            <Option value="superAdmin">超级管理员</Option>
          </Select>
          
          <Select
            placeholder="选择状态"
            allowClear
            size="middle"
            onChange={setUserStatus}
            style={{ width: 150 }}
          >
            <Option value="active">活跃</Option>
            <Option value="banned">封禁</Option>
            <Option value="pending">待审核</Option>
          </Select>
        </Space>
      </Card>

      {/* 用户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={filteredUsers}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 编辑用户模态框 */}
      <Modal
        title="编辑用户信息"
        visible={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
      >
        <p>用户ID: {selectedUser?.id}</p>
        <p>用户名: {selectedUser?.username}</p>
        <p>邮箱: {selectedUser?.email}</p>
        {/* 这里可以添加更复杂的编辑表单 */}
      </Modal>
    </div>
  )
}

export default UserManagement