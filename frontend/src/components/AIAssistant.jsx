import React, { useState, useRef, useEffect } from 'react'
import { Card, Input, Button, message, Avatar, List, Typography, Spin } from 'antd'
import { SendOutlined, MessageOutlined, LoadingOutlined, UserOutlined } from '@ant-design/icons'
import { aiAPI } from '../services/api'

const { Text } = Typography

const AIAssistant = () => {
  const [inputValue, setInputValue] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // 发送消息
  const handleSend = async () => {
    if (!inputValue.trim()) {
      message.warning('请输入您的问题')
      return
    }

    const userMessage = {
      type: 'user',
      content: inputValue,
      time: new Date().toLocaleTimeString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setLoading(true)

    try {
      const response = await aiAPI.askAI({ question: inputValue })
      if (response.success && response.data) {
        const aiMessage = {
          type: 'ai',
          content: response.data.answer,
          time: new Date().toLocaleTimeString()
        }
        setMessages(prev => [...prev, aiMessage])
      } else {
        message.error('AI回答失败，请重试')
      }
    } catch (error) {
      console.error('Failed to get AI response:', error)
      message.error('AI回答失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  // 处理回车键发送
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Card 
      title={<>
        <MessageOutlined style={{ marginRight: 8 }} />
        校园知识问答机器人
      </>}
      style={{ marginBottom: 16 }}
    >
      {/* 聊天记录 */}
      <div style={{ 
        height: 400, 
        overflowY: 'auto', 
        padding: 16, 
        border: '1px solid #f0f0f0', 
        borderRadius: 8, 
        marginBottom: 16,
        background: '#fafafa' 
      }}>
        <List
          dataSource={messages}
          renderItem={item => (
            <List.Item style={{ padding: '8px 0' }}>
              <List.Item.Meta
                avatar={
                  <Avatar 
                    icon={item.type === 'user' ? <UserOutlined /> : <MessageOutlined />} 
                    style={{ 
                      backgroundColor: item.type === 'user' ? '#1890ff' : '#52c41a' 
                    }} 
                  />
                }
                title={<>
                  <Text strong>{item.type === 'user' ? '我' : '校园知识助手'}</Text>
                  <Text style={{ marginLeft: 8, fontSize: 12, color: '#999' }}>
                    {item.time}
                  </Text>
                </>}
                description={
                  <div style={{ 
                    backgroundColor: item.type === 'user' ? '#e6f7ff' : '#f6ffed', 
                    padding: 12, 
                    borderRadius: 8,
                    maxWidth: '70%'
                  }}>
                    {item.content}
                  </div>
                }
              />
            </List.Item>
          )}
        />
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
              <Spin indicator={<LoadingOutlined spin />} />
              <span style={{ marginLeft: '10px' }}>AI思考中...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入区域 */}
      <div style={{ display: 'flex', gap: 8 }}>
        <Input.TextArea
          placeholder="请问您有什么问题？例如：'食堂开放时间'、'如何办理校园卡'、'选课指南'"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onPressEnter={handleKeyPress}
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{ flex: 1 }}
        />
        <Button 
          type="primary" 
          icon={<SendOutlined />} 
          onClick={handleSend}
          loading={loading}
        >
          发送
        </Button>
      </div>

      {/* 常见问题提示 */}
      <div style={{ marginTop: 16, padding: 12, backgroundColor: '#f0f2f5', borderRadius: 8 }}>
        <Text strong style={{ display: 'block', marginBottom: 8 }}>💡 常见问题示例：</Text>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {[
            '食堂开放时间', 
            '如何办理校园卡', 
            '选课指南', 
            '图书馆开馆时间',
            '宿舍门禁时间',
            '校园网连接方法',
            '奖学金申请流程',
            '如何申请实验室'
          ].map((question, index) => (
            <Button 
              key={index} 
              size="small" 
              onClick={() => {
                setInputValue(question)
              }}
            >
              {question}
            </Button>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default AIAssistant