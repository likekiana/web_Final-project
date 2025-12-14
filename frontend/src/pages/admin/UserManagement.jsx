import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Input, Select, Modal, message, Form, Divider } from 'antd'
import { SearchOutlined, EditOutlined, DeleteOutlined, UserOutlined, LockOutlined, UnlockOutlined, CloseCircleOutlined, CheckCircleOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'

const { Title } = Typography
const { Search } = Input

const UserManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [userRole, setUserRole] = useState('')
  const [userStatus, setUserStatus] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [modalType, setModalType] = useState('') // 'role' or 'password'
  const [selectedUser, setSelectedUser] = useState(null)
  const [users, setUsers] = useState([])
  const [form] = Form.useForm()

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
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="small" 
            onClick={() => handleRoleUpdate(record)}
          >
            设置角色
          </Button>
          <Button 
            type={record.status === 'active' ? 'danger' : 'success'} 
            icon={record.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />} 
            size="small" 
            onClick={() => handleToggleBan(record)}
          >
            {record.status === 'active' ? '封禁' : '解封'}
          </Button>
          <Button 
            type="default" 
            icon={<LockOutlined />} 
            size="small" 
            onClick={() => handleResetPassword(record)}
          >
            重置密码
          </Button>
        </Space>
      )
    }
  ]

  const handleSearch = (value) => {
    setSearchText(value)
  }

  // 处理角色更新
  const handleRoleUpdate = (user) => {
    setSelectedUser(user)
    setModalType('role')
    setIsModalVisible(true)
    form.setFieldsValue({ role: user.role })
  }

  // 处理密码重置
  const handleResetPassword = (user) => {
    setSelectedUser(user)
    setModalType('password')
    setIsModalVisible(true)
    form.setFieldsValue({ newPassword: '' })
  }

  // 处理封禁/解封用户
  const handleToggleBan = (user) => {
    const newStatus = user.status === 'active' ? 'banned' : 'active'
    const actionText = newStatus === 'banned' ? '封禁' : '解封'
    const confirmText = newStatus === 'banned' ? '确定要封禁这个用户吗？' : '确定要解封这个用户吗？'
    
    Modal.confirm({
      title: `确认${actionText}`,
      content: confirmText,
      okText: '确定',
      okType: newStatus === 'banned' ? 'danger' : 'success',
      cancelText: '取消',
      onOk: async () => {
        setLoading(true)
        try {
          const response = await adminAPI.updateUserStatus(user.id, { status: newStatus })
          if (response.success) {
            message.success(`${actionText}成功`)
            fetchUsers() // 刷新用户列表
          } else {
            message.error(response.message || `${actionText}失败`)
          }
        } catch (error) {
          console.error(`${actionText}用户失败:`, error)
          message.error(`${actionText}失败`)
        } finally {
          setLoading(false)
        }
      }
    })
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      if (modalType === 'role') {
        // 更新角色
        const response = await adminAPI.updateUserRole(selectedUser.id, { role: values.role })
        if (response.success) {
          message.success('角色更新成功')
          setIsModalVisible(false)
          fetchUsers() // 刷新用户列表
        } else {
          message.error(response.message || '角色更新失败')
        }
      } else if (modalType === 'password') {
        // 重置密码
        const response = await adminAPI.resetUserPassword(selectedUser.id, { password: values.newPassword })
        if (response.success) {
          message.success('密码重置成功')
          setIsModalVisible(false)
        } else {
          message.error(response.message || '密码重置失败')
        }
      }
    } catch (error) {
      console.error('处理模态框确认失败:', error)
      message.error('操作失败')
    } finally {
      setLoading(false)
    }
  }

  // 处理模态框取消
  const handleModalCancel = () => {
    setIsModalVisible(false)
    setSelectedUser(null)
    setModalType('')
    form.resetFields()
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
        title={modalType === 'role' ? '设置用户角色' : '重置用户密码'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        width={500}
      >
        <Form form={form} layout="vertical">
          <div style={{ marginBottom: 16 }}>
            <p><strong>用户ID:</strong> {selectedUser?.id}</p>
            <p><strong>用户名:</strong> {selectedUser?.username}</p>
            <p><strong>邮箱:</strong> {selectedUser?.email}</p>
          </div>
          <Divider />
          
          {modalType === 'role' ? (
            <Form.Item
              name="role"
              label="用户角色"
              rules={[{ required: true, message: '请选择用户角色' }]}
            >
              <Select placeholder="请选择用户角色">
                <Select.Option value="student">学生</Select.Option>
                <Select.Option value="merchant">商户</Select.Option>
                <Select.Option value="moderator">版主</Select.Option>
                <Select.Option value="admin">管理员</Select.Option>
                <Select.Option value="superAdmin">超级管理员</Select.Option>
              </Select>
            </Form.Item>
          ) : (
            <Form.Item
              name="newPassword"
              label="新密码"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码长度不能少于6位' }
              ]}
            >
              <Input.Password placeholder="请输入新密码" />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  )
}

export default UserManagement