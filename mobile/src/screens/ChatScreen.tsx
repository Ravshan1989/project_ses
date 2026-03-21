import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { io, Socket } from 'socket.io-client';
import { MessageCircle, Send, User, ArrowLeft } from 'lucide-react-native';
import { SOCKET_URL } from '../config';
import { chatApi, usersApi, authApi } from '../services/api';

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
}

interface UserData {
  id: string;
  username: string;
  fullName?: string;
  role: string;
}

const ChatScreen = () => {
  const [currentUser, setCurrentUser] = useState<UserData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const profileRes = await authApi.getProfile();
        const me = profileRes.data;
        setCurrentUser(me);

        const usersRes = await usersApi.getAll();
        setUsers(usersRes.data.filter((u: UserData) => u.id !== me.id));

        const newSocket = io(`${SOCKET_URL}/chat`, {
          query: { userId: me.id },
          transports: ['websocket'],
        });

        newSocket.on('newMessage', (msg: Message) => {
          setMessages((prev) => {
            // Only add if it belongs to current conversation
            const isRelevant = 
              (msg.senderId === me.id && msg.receiverId === selectedUser?.id) ||
              (msg.senderId === selectedUser?.id && msg.receiverId === me.id);
            
            if (isRelevant) return [...prev, msg];
            return prev;
          });
        });

        setSocket(newSocket);
      } catch (err) {
        console.error('Chat init error', err);
      }
    };

    init();

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (selectedUser && currentUser) {
      loadHistory();
    }
  }, [selectedUser]);

  const loadHistory = async () => {
    if (!selectedUser || !currentUser) return;
    setLoading(true);
    try {
      const res = await chatApi.getHistory(currentUser.id, selectedUser.id);
      setMessages(res.data);
    } catch (err) {
      console.error('Load history error', err);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = () => {
    if (!inputValue.trim() || !selectedUser || !socket || !currentUser) return;

    const msgData = {
      senderId: currentUser.id,
      receiverId: selectedUser.id,
      content: inputValue,
    };

    socket.emit('sendMessage', msgData);
    setInputValue('');
  };

  const renderUserItem = ({ item }: { item: UserData }) => (
    <TouchableOpacity 
      style={styles.userItem} 
      onPress={() => setSelectedUser(item)}
    >
      <View style={styles.avatar}>
        <User color="#64748b" size={24} />
      </View>
      <View style={styles.userInfo}>
        <Text style={styles.userName}>{item.fullName || item.username}</Text>
        <Text style={styles.userRole}>{item.role}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderMessageItem = ({ item }: { item: Message }) => {
    const isMe = item.senderId === currentUser?.id;
    return (
      <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
        <Text style={[styles.messageTime, isMe ? styles.myMessageTime : styles.theirMessageTime]}>
          {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </Text>
      </View>
    );
  };

  if (!selectedUser) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Xabarlar</Text>
        </View>
        <FlatList
          data={users}
          renderItem={renderUserItem}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View style={styles.centered}>
              <ActivityIndicator color="#1677ff" />
            </View>
          }
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.chatHeader}>
        <TouchableOpacity onPress={() => setSelectedUser(null)} style={styles.backButton}>
          <ArrowLeft color="#1e293b" size={24} />
        </TouchableOpacity>
        <View style={styles.chatHeaderInfo}>
          <Text style={styles.chatHeaderName}>{selectedUser.fullName || selectedUser.username}</Text>
          <Text style={styles.chatHeaderStatus}>Online</Text>
        </View>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={styles.chatContainer}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessageItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
          onLayout={() => flatListRef.current?.scrollToEnd()}
        />

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Xabar yozing..."
            value={inputValue}
            onChangeText={setInputValue}
            multiline
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputValue.trim() && styles.sendButtonDisabled]} 
            onPress={sendMessage}
            disabled={!inputValue.trim()}
          >
            <Send color="#fff" size={20} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1e293b',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  userItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    alignItems: 'center',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  userRole: {
    fontSize: 13,
    color: '#64748b',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  backButton: {
    marginRight: 15,
  },
  chatHeaderInfo: {
    flex: 1,
  },
  chatHeaderName: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1e293b',
  },
  chatHeaderStatus: {
    fontSize: 12,
    color: '#10b981',
  },
  chatContainer: {
    flex: 1,
  },
  messageList: {
    padding: 15,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 20,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#1677ff',
    borderBottomRightRadius: 2,
  },
  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#fff',
    borderBottomLeftRadius: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  messageText: {
    fontSize: 15,
  },
  myMessageText: {
    color: '#fff',
  },
  theirMessageText: {
    color: '#1e293b',
  },
  messageTime: {
    fontSize: 10,
    marginTop: 4,
    textAlign: 'right',
  },
  myMessageTime: {
    color: 'rgba(255,255,255,0.7)',
  },
  theirMessageTime: {
    color: '#94a3b8',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#1677ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
});

export default ChatScreen;
