import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { SocketContext } from '../context/SocketContext.jsx';
import api from '../services/api.js';
import Sidebar from '../components/Sidebar.jsx';
import ChatHeader from '../components/ChatHeader.jsx';
import ChatMessages from '../components/ChatMessages.jsx';
import MessageInput from '../components/MessageInput.jsx';
import { Laptop, Lock } from 'lucide-react';

const ChatDashboard = () => {
  const { user } = useContext(AuthContext);
  const { socket, onlineUsers } = useContext(SocketContext);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  
  // Real-time states
  const [typingStatus, setTypingStatus] = useState({}); // conversationId -> boolean
  const [activeTypingUser, setActiveTypingUser] = useState(false); // is active user typing?
  const [loadingHistory, setLoadingHistory] = useState(false);

  // 1. Fetch initial conversations on load
  const fetchConversations = async () => {
    try {
      const res = await api.get('/chats/conversations');
      if (res.data.success) {
        setConversations(res.data.conversations);
      }
    } catch (err) {
      console.error('Failed to load conversations list:', err);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  // 2. Fetch messages whenever active conversation changes
  useEffect(() => {
    if (!activeConversation) return;

    const fetchMessages = async () => {
      setLoadingHistory(true);
      try {
        const res = await api.get(`/chats/messages/${activeConversation.conversationId}`);
        if (res.data.success) {
          setMessages(res.data.messages);
          
          // Join socket chat room
          socket?.emit('join_chat', activeConversation.conversationId);

          // Emit seen receipts for all unread messages in this conversation
          socket?.emit('message_seen', {
            conversationId: activeConversation.conversationId,
            senderId: activeConversation.otherUser.id
          });

          // Reset unread count locally in conversations sidebar list
          setConversations((prev) =>
            prev.map((c) =>
              c.conversationId === activeConversation.conversationId
                ? { ...c, unreadCount: 0 }
                : c
            )
          );
        }
      } catch (err) {
        console.error('Failed to load chat history:', err);
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchMessages();
  }, [activeConversation, socket]);

  // 3. Bind WebSocket Event Listeners
  useEffect(() => {
    if (!socket) return;

    // Handle receipt of live messages
    const handleReceiveMessage = (newMessage) => {
      const msgConvoId = newMessage.conversationId;

      // Case A: Message belongs to active conversation thread
      if (activeConversation && activeConversation.conversationId === msgConvoId) {
        setMessages((prev) => {
          // Safeguard against duplicate message objects in state array
          if (prev.some((m) => m.id === newMessage.id)) {
            return prev;
          }
          return [...prev, newMessage];
        });

        // If I am the receiver of this active message, mark it as read immediately
        if (newMessage.senderId !== user.id) {
          socket.emit('message_seen', {
            conversationId: msgConvoId,
            senderId: newMessage.senderId
          });
        }
      } else {
        // Case B: Message belongs to an inactive thread -> increment unread count in conversations list
        setConversations((prev) =>
          prev.map((c) =>
            c.conversationId === msgConvoId
              ? { ...c, unreadCount: (c.unreadCount || 0) + 1 }
              : c
          )
        );
      }

      // Automatically bubble conversation tile to the top of the sidebar list
      setConversations((prev) => {
        const existingConvoIdx = prev.findIndex((c) => c.conversationId === msgConvoId);
        
        let targetConvo;

        if (existingConvoIdx !== -1) {
          // Update last message preview
          targetConvo = {
            ...prev[existingConvoIdx],
            lastMessage: {
              id: newMessage.id,
              message: newMessage.message,
              senderId: newMessage.senderId,
              seen: newMessage.senderId === user.id ? newMessage.seen : true, // Keep seen local if received
              createdAt: newMessage.createdAt
            }
          };

          // Filter out existing index, and insert at the top
          const filtered = prev.filter((_, idx) => idx !== existingConvoIdx);
          return [targetConvo, ...filtered];
        } else {
          // Brand new conversation dynamic injection
          const otherUserHydrate = newMessage.senderId === user.id ? newMessage.receiver : newMessage.sender;
          targetConvo = {
            conversationId: msgConvoId,
            otherUser: otherUserHydrate,
            unreadCount: newMessage.senderId === user.id ? 0 : 1,
            lastMessage: {
              id: newMessage.id,
              message: newMessage.message,
              senderId: newMessage.senderId,
              seen: newMessage.seen,
              createdAt: newMessage.createdAt
            }
          };
          return [targetConvo, ...prev];
        }
      });
    };

    // Handle receipt of live typing notifications
    const handleTyping = ({ conversationId }) => {
      setTypingStatus((prev) => ({ ...prev, [conversationId]: true }));
      if (activeConversation && activeConversation.conversationId === conversationId) {
        setActiveTypingUser(true);
      }
    };

    const handleStopTyping = ({ conversationId }) => {
      setTypingStatus((prev) => ({ ...prev, [conversationId]: false }));
      if (activeConversation && activeConversation.conversationId === conversationId) {
        setActiveTypingUser(false);
      }
    };

    // Handle read receipts (seen checkmarks turns blue)
    const handleMessagesMarkedSeen = ({ conversationId }) => {
      if (activeConversation && activeConversation.conversationId === conversationId) {
        setMessages((prev) =>
          prev.map((m) => (m.senderId === user.id ? { ...m, seen: true } : m))
        );
      }

      setConversations((prev) =>
        prev.map((c) =>
          c.conversationId === conversationId && c.lastMessage.senderId === user.id
            ? { ...c, lastMessage: { ...c.lastMessage, seen: true } }
            : c
        )
      );
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('stop_typing', handleStopTyping);
    socket.on('messages_marked_seen', handleMessagesMarkedSeen);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('stop_typing', handleStopTyping);
      socket.off('messages_marked_seen', handleMessagesMarkedSeen);
    };
  }, [socket, activeConversation, user]);

  // 4. Send Message via Socket.io
  const handleSendMessage = (messageText) => {
    if (!socket || !activeConversation) return;

    socket.emit('send_message', {
      conversationId: activeConversation.conversationId,
      receiverId: activeConversation.otherUser.id,
      message: messageText
    });
  };

  // 5. Manage Typing indicators
  const handleTypingStart = () => {
    if (!socket || !activeConversation) return;
    socket.emit('typing', {
      conversationId: activeConversation.conversationId,
      receiverId: activeConversation.otherUser.id
    });
  };

  const handleTypingStop = () => {
    if (!socket || !activeConversation) return;
    socket.emit('stop_typing', {
      conversationId: activeConversation.conversationId,
      receiverId: activeConversation.otherUser.id
    });
  };

  // 6. Handle starting chat with a new contact from Search Results
  const handleStartNewChat = async (targetUser) => {
    console.log('Initiating chat connection with contact:', targetUser);
    try {
      const res = await api.post('/chats/conversation', { receiverId: targetUser.id });
      console.log('Backend response for conversation creation:', res.data);
      
      if (res.data.success) {
        const convoId = res.data.conversationId;
        console.log('Target Conversation ID resolved:', convoId);
        
        // Check if conversation already exists in our sidebar list
        const existingConvo = conversations.find((c) => c.conversationId === convoId);
        
        if (existingConvo) {
          console.log('Conversation already active in list. Switching focus.');
          setActiveConversation(existingConvo);
        } else {
          console.log('Initializing fresh conversation metadata tile.');
          // Initialize a temporary conversation details block
          const newConvoData = {
            conversationId: convoId,
            otherUser: targetUser,
            unreadCount: 0,
            lastMessage: null
          };
          
          setConversations((prev) => [newConvoData, ...prev]);
          setActiveConversation(newConvoData);
          console.log('Switched focus to newly initialized thread.');
        }
      }
    } catch (err) {
        console.error('Failed to create or open conversation session:', err);
      }
    };

    return (
    <div className="flex h-screen w-screen bg-slate-50 dark:bg-[#080d16] overflow-hidden select-none transition-colors duration-300">
      
      {/* Sidebar - Hidden on mobile if a conversation is actively open */}
      <div className={`w-full md:w-[400px] md:block flex-shrink-0 h-full ${activeConversation ? 'hidden' : 'block'}`}>
        <Sidebar
          activeConversation={activeConversation}
          setActiveConversation={setActiveConversation}
          conversations={conversations}
          setConversations={setConversations}
          typingStatus={typingStatus}
          onStartNewChat={handleStartNewChat}
        />
      </div>

      {/* Chat Area - Occupies remaining width, hidden on mobile if sidebar list is visible */}
      <div className={`flex-1 flex flex-col h-full bg-slate-50 dark:bg-[#0b0f19] border-l border-slate-100 dark:border-slate-800/40 ${!activeConversation ? 'hidden md:flex' : 'flex'}`}>
        {activeConversation ? (
          <>
            {/* Header */}
            <ChatHeader
              otherUser={activeConversation.otherUser}
              isTyping={activeTypingUser || typingStatus[activeConversation.conversationId]}
              onBackClick={() => setActiveConversation(null)}
            />

            {/* Chat Viewport with Shimmer Loaders */}
            {loadingHistory ? (
              <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#0b0f19]">
                <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-3"></div>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">Retrieving messages...</span>
              </div>
            ) : (
              <ChatMessages
                messages={messages}
                currentUserId={user.id}
                isTyping={activeTypingUser || typingStatus[activeConversation.conversationId]}
              />
            )}

            {/* Input Bar */}
            <MessageInput
              onSendMessage={handleSendMessage}
              onTypingStart={handleTypingStart}
              onTypingStop={handleTypingStop}
            />
          </>
        ) : (
          /* Empty Chat Screen Landing Page */
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-[#0b0f19]/30 border-b-4 border-brand-500 select-none relative overflow-hidden transition-all duration-300 gradient-orb-bg">
            <div className="flex flex-col items-center max-w-md z-10">
              <div className="w-48 h-48 rounded-full flex items-center justify-center text-brand-500/80 dark:text-brand-400/80 mb-8 bg-slate-100 dark:bg-slate-900 shadow-sm border border-slate-200/20 dark:border-slate-800">
                <Laptop className="w-24 h-24 stroke-[1.2]" />
              </div>
              <h3 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
                ChitrChatr
              </h3>
              <p className="text-[13.5px] text-slate-400 dark:text-slate-500 mt-4 leading-relaxed font-normal max-w-[360px]">
                Connect with friends and colleagues instantly in a secure, real-time workspace. Select a contact from the sidebar or search to start typing.
              </p>
              
              <div className="flex items-center gap-1.5 text-[11.5px] text-slate-400 dark:text-slate-500 mt-24 font-medium">
                <Lock className="w-3.5 h-3.5" />
                <span>Secure End-to-end encryption</span>
              </div>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

export default ChatDashboard;
