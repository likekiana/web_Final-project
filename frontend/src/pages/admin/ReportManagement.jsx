import React, { useState, useEffect } from 'react'
import { Card, Table, Typography, Button, Space, Tag, Select, Modal, message, Input } from 'antd'
import { SearchOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons'
import { adminAPI } from '../../services/api'

const { Title } = Typography
const { Option } = Select
const { TextArea, Search } = Input

const ReportManagement = () => {
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [reportType, setReportType] = useState('')
  const [reportStatus, setReportStatus] = useState('')
  const [reports, setReports] = useState([])
  const [processingReport, setProcessingReport] = useState(null)
  const [processingModalVisible, setProcessingModalVisible] = useState(false)
  const [action, setAction] = useState('')
  const [notes, setNotes] = useState('')

  // 从API获取举报列表
  useEffect(() => {
    fetchReports()
  }, [searchText, reportType, reportStatus])

  const fetchReports = async () => {
    setLoading(true)
    try {
      const response = await adminAPI.getReports({
        search: searchText,
        type: reportType,
        status: reportStatus,
        page: 1,
        limit: 100
      })
      if (response.success) {
        setReports(response.data.reports || [])
      } else {
        message.error(response.message || '获取举报列表失败')
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error)
      message.error('获取举报列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 举报状态标签配置
  const getReportStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">待处理</Tag>
      case 'processed':
        return <Tag color="green">已处理</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 举报类型标签配置
  const getReportTypeTag = (type) => {
    switch (type) {
      case 'spam':
        return <Tag color="red">垃圾广告</Tag>
      case 'pornography':
        return <Tag color="magenta">色情内容</Tag>
      case 'violence':
        return <Tag color="purple">暴力内容</Tag>
      case 'other':
        return <Tag color="blue">其他违规</Tag>
      default:
        return <Tag color="gray">未知</Tag>
    }
  }

  // 处理动作配置
  const actionOptions = [
    { value: 'ignore', label: '忽略' },
    { value: 'delete', label: '删除内容' },
    { value: 'warn', label: '警告用户' }
  ]

  // 表格列配置
  const columns = [
    {
      title: '举报ID',
      dataIndex: 'id',
      key: 'id',
      width: 80
    },
    {
      title: '举报类型',
      dataIndex: 'type',
      key: 'type',
      render: (text) => getReportTypeTag(text)
    },
    {
      title: '举报内容',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: {
        rows: 2,
        expandable: true
      }
    },
    {
      title: '目标类型',
      dataIndex: 'targetType',
      key: 'targetType',
      render: (text) => (
        <Tag color="blue">
          {text === 'post' ? '帖子' : text === 'comment' ? '评论' : text}
        </Tag>
      )
    },
    {
      title: '目标ID',
      dataIndex: 'targetId',
      key: 'targetId',
      width: 80
    },
    {
      title: '目标标题',
      dataIndex: 'targetTitle',
      key: 'targetTitle',
      ellipsis: {
        rows: 1
      }
    },
    {
      title: '举报者',
      dataIndex: 'reporterName',
      key: 'reporterName'
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (text) => getReportStatusTag(text)
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt'
    },
    {
      title: '处理人',
      dataIndex: 'processedBy',
      key: 'processedBy'
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'pending' && (
            <Button 
              type="primary" 
              icon={<CheckCircleOutlined />} 
              size="small" 
              onClick={() => handleProcessReport(record)}
            >
              处理
            </Button>
          )}
        </Space>
      )
    }
  ]

  const handleProcessReport = (report) => {
    setProcessingReport(report)
    setAction('')
    setNotes('')
    setProcessingModalVisible(true)
  }

  const handleModalOk = async () => {
    if (!action) {
      message.error('请选择处理动作')
      return
    }
    
    setLoading(true)
    try {
      const response = await adminAPI.processReport(processingReport.id, {
        status: 'processed',
        action,
        notes
      })
      if (response.success) {
        message.success('举报处理成功')
        setProcessingModalVisible(false)
        fetchReports()
      } else {
        message.error(response.message || '举报处理失败')
      }
    } catch (error) {
      console.error('Failed to process report:', error)
      message.error('举报处理失败')
    } finally {
      setLoading(false)
    }
  }

  const handleModalCancel = () => {
    setProcessingModalVisible(false)
    setProcessingReport(null)
    setAction('')
    setNotes('')
  }

  return (
    <div>
      <Title level={2}>举报管理</Title>
      
      {/* 搜索和筛选区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="middle" wrap>
          <Search
            placeholder="搜索举报内容或目标标题"
            allowClear
            enterButton={<SearchOutlined />}
            size="middle"
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          
          <Select
            placeholder="选择举报类型"
            allowClear
            size="middle"
            onChange={setReportType}
            style={{ width: 150 }}
          >
            <Option value="spam">垃圾广告</Option>
            <Option value="pornography">色情内容</Option>
            <Option value="violence">暴力内容</Option>
            <Option value="other">其他违规</Option>
          </Select>
          
          <Select
            placeholder="选择处理状态"
            allowClear
            size="middle"
            onChange={setReportStatus}
            style={{ width: 150 }}
          >
            <Option value="pending">待处理</Option>
            <Option value="processed">已处理</Option>
          </Select>
        </Space>
      </Card>

      {/* 举报列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      {/* 处理举报模态框 */}
      <Modal
        title="处理举报"
        open={processingModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={loading}
        okText="确认处理"
        cancelText="取消"
        width={600}
      >
        {processingReport && (
          <div>
            <p><strong>举报ID:</strong> {processingReport.id}</p>
            <p><strong>举报类型:</strong> {getReportTypeTag(processingReport.type)}</p>
            <p><strong>举报内容:</strong> {processingReport.reason}</p>
            <p><strong>目标类型:</strong> {processingReport.targetType === 'post' ? '帖子' : '评论'}</p>
            <p><strong>目标ID:</strong> {processingReport.targetId}</p>
            <p><strong>目标标题:</strong> {processingReport.targetTitle}</p>
            <p><strong>举报者:</strong> {processingReport.reporterName}</p>
            <p><strong>创建时间:</strong> {processingReport.createdAt}</p>
            
            <div style={{ marginTop: 20 }}>
              <p style={{ marginBottom: 8 }}><strong>处理动作:</strong></p>
              <Select
                style={{ width: '100%', marginBottom: 16 }}
                placeholder="请选择处理动作"
                value={action}
                onChange={setAction}
              >
                {actionOptions.map(option => (
                  <Option key={option.value} value={option.value}>
                    {option.label}
                  </Option>
                ))}
              </Select>
              
              <p style={{ marginBottom: 8 }}><strong>处理备注:</strong></p>
              <TextArea
                rows={4}
                placeholder="请输入处理备注（可选）"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default ReportManagement