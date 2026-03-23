import React, { useRef, useEffect } from 'react';
import { Modal, Input, List, Avatar, Button, Typography, Badge, Spin, Space } from 'antd';
import { SendOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { useChat, User } from './ChatContext';

const { Text, Title } = Typography;

const ChatWindow: React.FC = () => {
  const {
    messages,
    isChatVisible,
    setIsChatVisible,
    selectedUser,
    setSelectedUser,
    users,
    onlineUserIds,
    fetchHistory,
    sendMessage,
    loading
  } = useChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleUserClick = (user: User) => {
    setSelectedUser(user);
    fetchHistory(user.id);
  };

  const [inputValue, setInputValue] = React.useState('');

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  return (
    <Modal
      title={
        <Space>
          <MessageOutlined style={{ color: '#1677ff' }} />
          <span>Real-Vaqt Chat</span>
        </Space>
      }
      open={isChatVisible}
      onCancel={() => setIsChatVisible(false)}
      footer={null}
      width={800}
      styles={{ body: { height: '500px', display: 'flex', padding: 0 } }}
      centered
      style={{ borderRadius: '20px', overflow: 'hidden' }}
    >
      <div style={{ width: '250px', borderRight: '1px solid #f0f0f0', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px', background: '#fafafa', borderBottom: '1px solid #f0f0f0' }}>
          <Title level={5} style={{ margin: 0 }}>Foydalanuvchilar</Title>
        </div>
        <List
          style={{ flex: 1, overflowY: 'auto' }}
          dataSource={users}
          renderItem={(user) => (
            <List.Item
              onClick={() => handleUserClick(user)}
              style={{
                cursor: 'pointer',
                padding: '12px 16px',
                background: selectedUser?.id === user.id ? '#e6f4ff' : 'transparent',
                transition: 'all 0.3s'
              }}
            >
              <List.Item.Meta
                avatar={
                  <Badge dot status={onlineUserIds.has(user.id) ? "success" : "default"} offset={[-2, 28]}>
                    <Avatar icon={<UserOutlined />} />
                  </Badge>
                }
                title={user.fullName || user.username}
                description={<Text type="secondary" style={{ fontSize: '12px' }}>{user.role}</Text>}
              />
            </List.Item>
          )}
        />
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#fff' }}>
        {selectedUser ? (
          <>
            <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <Avatar size="small" icon={<UserOutlined />} />
              <Text strong>{selectedUser.fullName || selectedUser.username}</Text>
            </div>
            
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {loading ? (
                <div style={{ textAlign: 'center', marginTop: '100px' }}><Spin /></div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      alignSelf: msg.senderId === currentUserId ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      padding: '10px 14px',
                      borderRadius: msg.senderId === currentUserId ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                      background: msg.senderId === currentUserId ? '#1677ff' : '#f0f0f0',
                      color: msg.senderId === currentUserId ? '#fff' : '#000',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div>{msg.content}</div>
                    <div style={{ fontSize: '10px', opacity: 0.7, textAlign: 'right', marginTop: '4px' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: '8px' }}>
              <Input
                placeholder="Xabar yozing..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onPressEnter={handleSend}
                style={{ borderRadius: '20px' }}
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!inputValue.trim()}
              />
            </div>
          </>
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8c8c8c' }}>
            <div style={{ textAlign: 'center' }}>
              <MessageOutlined style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.2 }} />
              <p>Muloqotni boshlash uchun foydalanuvchini tanlang</p>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ChatWindow;
