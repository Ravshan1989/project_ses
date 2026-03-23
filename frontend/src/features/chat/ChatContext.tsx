import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { API_BASE_URL, SOCKET_URL } from '../../config';

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

export interface User {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  first_name?: string; // Fallback for snake_case
  last_name?: string; // Fallback for snake_case
  role: string;
  department?: {
    id: string;
    name: string;
  };
}

interface ChatContextType {
  socket: Socket | null;
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  isChatVisible: boolean;
  setIsChatVisible: (visible: boolean) => void;
  selectedUser: User | null;
  setSelectedUser: (user: User | null) => void;
  users: User[];
  onlineUserIds: Set<string>;
  fetchHistory: (otherUserId: string) => Promise<void>;
  sendMessage: (content: string) => void;
  loading: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isChatVisible, setIsChatVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [onlineUserIds, setOnlineUserIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  
  const currentUserId = localStorage.getItem('user_id');
  const selectedUserRef = useRef<User | null>(null);

  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    if (localStorage.getItem('access_token') && currentUserId) {
      fetchUsers();
      
      const newSocket = io(`${SOCKET_URL}/chat`, {
        query: { userId: currentUserId },
        transports: ['websocket'],
      });

      newSocket.on('connect', () => {
        newSocket.emit('getOnlineUsers', (ids: string[]) => {
          setOnlineUserIds(new Set(ids));
        });
      });

      newSocket.on('userStatusChanged', ({ userId, status }: { userId: string, status: 'online' | 'offline' }) => {
        setOnlineUserIds(prev => {
          const next = new Set(prev);
          if (status === 'online') next.add(userId);
          else next.delete(userId);
          return next;
        });
      });

      newSocket.on('newMessage', (msg: Message) => {
        const currentSelected = selectedUserRef.current;
        if (currentSelected && (msg.senderId === currentSelected.id || msg.senderId === currentUserId)) {
          setMessages(prev => {
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      });

      newSocket.on('messageSent', (msg: Message) => {
        const currentSelected = selectedUserRef.current;
        if (currentSelected && msg.receiverId === currentSelected.id) {
          setMessages(prev => {
            const exists = prev.some(m => m.id === msg.id || (m.id.startsWith('tmp_') && m.content === msg.content));
            if (!exists) return [...prev, msg];
            return prev.map(m => (m.id.startsWith('tmp_') && m.content === msg.content) ? msg : m);
          });
        }
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [currentUserId]);

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
    if (!currentUserId) return;
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${API_BASE_URL}/chat/history?user1Id=${currentUserId}&user2Id=${otherUserId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Fetch history error', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = (content: string) => {
    if (!content.trim() || !selectedUser || !socket || !currentUserId) return;

    const tempId = `tmp_${Date.now()}`;
    const msgData = {
      senderId: currentUserId,
      receiverId: selectedUser.id,
      content,
    };

    const optimisticMsg: Message = {
      ...msgData,
      id: tempId,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    
    setMessages(prev => [...prev, optimisticMsg]);
    socket.emit('sendMessage', msgData);
  };

  return (
    <ChatContext.Provider value={{
      socket, messages, setMessages, isChatVisible, setIsChatVisible,
      selectedUser, setSelectedUser, users, onlineUserIds, fetchHistory,
      sendMessage, loading
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};
