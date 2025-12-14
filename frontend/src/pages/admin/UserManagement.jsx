import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'

const { Title } = Typography
const { Search } = Input

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])

  // 从API获取用户数据
  useEffect(() => {
    fetchUsers()
  }, [searchText, userRole, userStatus])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getUsers({
        search: searchText,
        role: userRole,
        status: userStatus
      })
      if (response.success) {
        setUsers(response.data.users || [])
      } else {
        message.error(response.message || '获取用户列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
      message.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 用户数据已经通过API筛选，这里不再需要本地筛选
  const filteredUsers = users

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
            <Select.Option value="student">学生</Select.Option>
            <Select.Option value="merchant">商户</Select.Option>
            <Select.Option value="moderator">版主</Select.Option>
            <Select.Option value="admin">管理员</Select.Option>
            <Select.Option value="superAdmin">超级管理员</Select.Option>
          </Select>
          
          <Select
            placeholder="选择状态"
            allowClear
            size="middle"
            onChange={setUserStatus}
            style={{ width: 150 }}
          >
            <Select.Option value="active">活跃</Select.Option>
            <Select.Option value="banned">封禁</Select.Option>
            <Select.Option value="pending">待审核</Select.Option>
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
        open={isModalVisible}
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