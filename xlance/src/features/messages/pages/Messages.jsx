// src/pages/Messages.jsx
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Search, Send, Plus, Paperclip, Smile, ArrowLeft, Phone, Video,
  MessageSquare, CircleDashed, Users, Settings, LogOut, MoreVertical,
  Mic, Check, CheckCheck, GripVertical
} from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { messageService } from '../services/messageService';

const Messages = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [selectedConvId, setSelectedConvId] = useState(location.state?.conversationId || null);
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);

  // Resizing Logic
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [leftWidth, setLeftWidth] = useState(380); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.innerWidth >= 768 : true);

  const messagesEndRef = useRef(null);

  // Responsive Check
  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 1. Subscribe to Conversations List
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = messageService.subscribeToConversations(user.uid, (data) => {
      const formatted = data.map(conv => {
        const otherId = conv.participants.find(p => p !== user.uid);
        const details = conv.participantDetails?.[otherId] || { name: 'User', avatar: '' };

        return {
          id: conv.id,
          otherId,
          name: details.name,
          avatar: details.avatar,
          lastMessage: conv.lastMessage || 'No messages yet',
          time: conv.lastMessageTime?.toDate
            ? conv.lastMessageTime.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : '',
          timestamp: conv.lastMessageTime?.toDate ? conv.lastMessageTime.toDate() : new Date(0),
          unread: conv.unreadCounts?.[user.uid] || 0
        };
      });
      formatted.sort((a, b) => b.timestamp - a.timestamp);
      setConversations(formatted);
      setLoadingConvs(false);
    });

    return () => unsubscribe();
  }, [user]);

  // 2. Subscribe to Messages
  useEffect(() => {
    if (!selectedConvId) {
      setMessages([]);
      return;
    }

    if (user?.uid) {
      messageService.markAsRead(selectedConvId, user.uid).catch(console.error);
    }

    const unsubscribe = messageService.subscribeToMessages(selectedConvId, (data) => {
      const formatted = data.map(m => ({
        id: m.id,
        text: m.text,
        fromMe: m.senderId === user.uid,
        time: m.createdAt ? m.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...',
        status: 'read'
      }));
      setMessages(formatted);
    });

    return () => unsubscribe();
  }, [selectedConvId, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Resizing Handlers
  useEffect(() => {
    const onMove = (e) => {
      if (!isResizing) return;
      e.preventDefault();

      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - startXRef.current;

      const containerWidth = containerRef.current ? containerRef.current.getBoundingClientRect().width : window.innerWidth;
      const maxLeft = Math.min(800, containerWidth - 300);
      const newWidth = Math.max(280, Math.min(maxLeft, startWidthRef.current + delta));

      setLeftWidth(newWidth);
    };

    const onUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', onMove);
      window.addEventListener('mouseup', onUp);
      window.addEventListener('touchmove', onMove);
      window.addEventListener('touchend', onUp);
    }

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [isResizing]);

  const startResize = (clientX) => {
    startXRef.current = clientX;
    startWidthRef.current = leftWidth;
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleSend = async () => {
    if (!text.trim() || !selectedConvId || !user) return;
    const msgText = text.trim();
    setText('');

    try {
      await messageService.sendMessage(selectedConvId, user.uid, msgText);
    } catch (error) {
      console.error("Failed to send:", error);
      setText(msgText);
    }
  };

  const initials = (name = '') => name.slice(0, 2).toUpperCase();
  const activeConv = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans pt-28 px-4 sm:px-6 lg:px-8 pb-6 select-none">
      <div
        ref={containerRef}
        className="flex w-full h-full max-w-7xl mx-auto rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-white relative"
      >

        {/* 1. Conversations List Panel (Resizable) */}
        <div
          className={`flex-col border-r border-gray-100 bg-white shrink-0 ${selectedConvId ? 'hidden md:flex' : 'flex w-full md:w-auto'}`}
          // Fix: Use isDesktop to determine width style. On Desktop, always respect leftWidth. On Mobile, 100% if active (handled by class).
          style={{ width: isDesktop ? leftWidth : '100%' }}
        >

          {/* Header */}
          <div className="h-16 px-5 flex items-center justify-between shrink-0 border-b border-gray-50">
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">Messages</h1>
            <button title="New Chat" className="w-8 h-8 flex items-center justify-center rounded-full bg-primary-50 text-primary-600 hover:bg-primary-100 transition-colors">
              <Plus size={18} />
            </button>
          </div>

          {/* Search */}
          <div className="px-5 py-4 shrink-0">
            <div className="bg-gray-50 rounded-xl flex items-center px-4 h-11 border border-transparent focus-within:border-primary-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-primary-50 transition-all">
              <Search size={18} className="text-gray-400 mr-3" />
              <input
                placeholder="Search conversations..."
                className="bg-transparent border-none text-gray-900 placeholder:text-gray-400 text-sm flex-1 focus:ring-0 px-0 font-medium"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-3 pb-3 custom-scrollbar">
            {conversations.length === 0 && !loadingConvs && (
              <div className="p-8 text-center text-gray-400 text-sm">No messages yet.</div>
            )}

            {conversations.map(conv => (
              <div
                key={conv.id}
                onClick={() => setSelectedConvId(conv.id)}
                className={`flex items-center p-3 mb-1 rounded-xl cursor-pointer transition-all ${selectedConvId === conv.id ? 'bg-primary-50 shadow-sm' : 'hover:bg-gray-50'}`}
              >
                {/* Avatar */}
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shrink-0 overflow-hidden text-sm font-bold shadow-sm ${selectedConvId === conv.id ? 'bg-primary-200 text-primary-700' : 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white'}`}>
                  {conv.avatar ? <img src={conv.avatar} className="w-full h-full object-cover" /> : initials(conv.name)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className={`font-semibold truncate ${selectedConvId === conv.id ? 'text-primary-900' : 'text-gray-900'}`}>{conv.name}</span>
                    <span className={`text-xs font-medium ${selectedConvId === conv.id ? 'text-primary-600' : 'text-gray-400'}`}>{conv.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm truncate max-w-[85%] ${conv.unread > 0 ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </span>
                    {conv.unread > 0 && (
                      <span className="min-w-[1.25rem] h-5 px-1 bg-primary-600 text-white rounded-full text-[10px] font-bold flex items-center justify-center shadow-sm">
                        {conv.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resizer Handle (Invisible when not in use) */}
        <div
          className={`hidden md:flex w-2 items-center justify-center cursor-col-resize hover:bg-gray-100/50 
              transition-all duration-300 z-50 group -ml-[1px] absolute h-full
              ${isResizing ? 'bg-primary-500/10' : 'bg-transparent'}
            `}
          style={{ left: leftWidth }} // Position exactly at the split
          onMouseDown={(e) => startResize(e.clientX)}
          onTouchStart={(e) => startResize(e.touches[0].clientX)}
        >
          {/* The visual indicator only appears on hover/drag */}
          <div className={`w-[3px] h-12 rounded-full bg-primary-300 transition-opacity duration-200 ${isResizing ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        </div>

        {/* 2. Main Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50/50 relative ${selectedConvId ? 'flex' : 'hidden md:flex'}`}>
          {!selectedConvId ? (
            // Empty State (Fallback Message)
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
              <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                <MessageSquare size={40} className="text-primary-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Select a Conversation</h2>
              <p className="text-gray-500 max-w-sm">Choose a chat from the left to start messaging your network.</p>
            </div>
          ) : (
            // Active Chat
            <>
              {/* Header */}
              <div className="h-16 px-6 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between shrink-0 sticky top-0 z-10 w-full">
                <div className="flex items-center gap-4">
                  <button className="md:hidden text-gray-500 hover:bg-gray-100 p-2 rounded-full -ml-2" onClick={() => setSelectedConvId(null)}>
                    <ArrowLeft size={20} />
                  </button>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
                      {activeConv?.avatar ? <img src={activeConv.avatar} className="w-full h-full object-cover" /> : initials(activeConv?.name)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 flex items-center gap-2">
                        {activeConv?.name}
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      </div>
                      <div className="text-xs text-gray-500 font-medium">Online</div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                    <Phone size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                    <Video size={20} />
                  </button>
                  <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all ml-1">
                    <MoreVertical size={20} />
                  </button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar space-y-4 bg-[#f8fafc]">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex w-full ${msg.fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-5 py-3 shadow-sm text-sm relative group transition-all hover:shadow-md ${msg.fromMe
                      ? 'bg-gradient-to-br from-primary-600 to-indigo-600 text-white rounded-br-sm'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                      }`}>
                      <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                      <div className={`flex items-center justify-end gap-1 mt-1 opacity-70 ${msg.fromMe ? 'text-primary-100' : 'text-gray-400'}`}>
                        <span className="text-[10px] font-medium">{msg.time}</span>
                        {msg.fromMe && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 bg-white border-t border-gray-100 w-full">
                <div className="flex items-end gap-2 bg-gray-50 p-2 rounded-2xl border border-gray-200 focus-within:border-primary-300 focus-within:ring-4 focus-within:ring-primary-50/50 transition-all shadow-inner">
                  <button className="p-2 mb-0.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-colors">
                    <Plus size={20} />
                  </button>

                  <textarea
                    className="flex-1 bg-transparent border-0 focus:ring-0 resize-none py-2 px-1 text-gray-700 placeholder-gray-400 outline-none"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder="Type a message..."
                    rows={1}
                  />

                  <button
                    onClick={handleSend}
                    disabled={!text.trim()}
                    className="p-2.5 mb-0.5 bg-primary-600 text-white rounded-xl shadow-md hover:bg-primary-700 disabled:opacity-50 disabled:shadow-none hover:scale-105 active:scale-95 transition-all"
                  >
                    <Send size={18} fill="currentColor" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
