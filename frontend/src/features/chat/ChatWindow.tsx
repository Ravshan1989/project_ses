import React, { useState, useEffect, useRef } from 'react';
import { Modal, Input, List, Avatar, Button, Typography, Badge, Spin, Space } from 'antd';
import { SendOutlined, MessageOutlined, UserOutlined } from '@ant-design/icons';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../../config';

const { Text, Title } = Typography;

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface User {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

const ChatWindow: React.FC<{ visible: boolean; onClose: () => void }> = ({ visible, onClose }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUserId = localStorage.getItem('user_id');

  useEffect(() => {
    if (visible && currentUserId) {
      fetchUsers();
      const newSocket = io(`${SOCKET_URL}/chat`, {
        query: { userId: currentUserId },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        // Request initial list of online users
        newSocket.emit('getOnlineUsers', (ids: string[]) => {
          setOnlineUserIds(new Set(ids));
        });
      });

      newSocket.on('userStatusChanged', ({ userId, status }: { userId: string, status: 'online' | 'offline' }) => {
        setOnlineUserIds((prev) => {
          const next = new Set(prev);
          if (status === 'online') {
            next.add(userId);
          } else {
            next.delete(userId);
          }
          return next;
        });
      });

      newSocket.on('newMessage', (msg: Message) => {
        if (selectedUser && (msg.senderId === selectedUser.id || msg.senderId === currentUserId)) {
          setMessages((prev) => [...prev, msg]);
        }
      });

      setSocket(newSocket);
      return () => {
        newSocket.disconnect();
      };
    }
  }, [visible, currentUserId]);

  useEffect(() => {
    if (selectedUser) {
      fetchHistory(selectedUser.id);
    }
  }, [selectedUser]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsers(data.filter((u: User) => u.id !== currentUserId));
      }
    } catch (err) {
      console.error('Fetch users error', err);
    }
  };

  const fetchHistory = async (otherUserId: string) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/chat/history?user1Id=${currentUserId}&user2Id=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMessages(await res.json());
      }
    } catch (err) {
      console.error('Fetch history error', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = () => {
    if (!inputValue.trim() || !selectedUser || !socket) return;

    const msgData = {
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content: inputValue,
    };

    socket.emit('sendMessage', msgData);
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
      open={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ height: '500px', display: 'flex', padding: 0 }}
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
              onClick={() => setSelectedUser(user)}
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
