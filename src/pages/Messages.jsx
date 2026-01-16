// src/pages/Messages.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Card, Button } from '../components/common';
import { Search, Send, Plus, Paperclip, Smile, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockChats, mockChatMessages } from '../utils/mockData';


const Messages = () => {
  const { userProfile } = useAuth();
  const [selected, setSelected] = useState(null); // WhatsApp-like: nothing selected initially
  const [allMessages, setAllMessages] = useState(mockChatMessages);
  const [text, setText] = useState('');
  const fileRef = useRef(null);

  const convs = mockChats;
  const activeConv = convs.find((c) => c.id === selected) || null;
  const messages = activeConv ? allMessages[selected] || [] : [];

  // resizable left column (conversations) width (desktop only)
  const containerRef = useRef(null);
  const startXRef = useRef(0);
  const startWidthRef = useRef(0);
  const [leftWidth, setLeftWidth] = useState(340);
  const [isResizing, setIsResizing] = useState(false);
  const [isDesktop, setIsDesktop] = useState(typeof window !== 'undefined' ? window.matchMedia('(min-width: 768px)').matches : true);

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = (e) => setIsDesktop(e.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  useEffect(() => {
    const onMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const delta = clientX - startXRef.current;
      const containerWidth = containerRef.current ? containerRef.current.getBoundingClientRect().width : window.innerWidth;
      const maxLeft = Math.max(240, Math.min(800, containerWidth - 240));
      let next = startWidthRef.current + delta;
      next = Math.max(220, Math.min(maxLeft, next));
      setLeftWidth(next);
    };

    const onUp = () => setIsResizing(false);

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchend', onUp);
    };
  }, [isResizing]);

  // while resizing, show resize cursor and prevent text selection
  useEffect(() => {
    if (isResizing) {
      const prev = document.body.style.userSelect;
      const prevCursor = document.body.style.cursor;
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';
      return () => {
        document.body.style.userSelect = prev;
        document.body.style.cursor = prevCursor;
      };
    }
    return undefined;
  }, [isResizing]);

  const startResize = (clientX) => {
    startXRef.current = clientX;
    startWidthRef.current = leftWidth;
    setIsResizing(true);
  };


  const initials = (name = '') =>
    name
      .split(' ')
      .filter(Boolean)
      .map((n) => n[0])
      .slice(0, 2)
      .join('');

  const handleSend = () => {
    if (!text.trim() || !activeConv) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      fromMe: true,
      text: text.trim(),
      time: 'Now',
    };

    setAllMessages((prev) => {
      const prevForConv = prev[selected] || [];
      return {
        ...prev,
        [selected]: [...prevForConv, newMsg],
      };
    });

    setText('');
  };

  // Close active chat on Escape
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelected(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <main className="pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-6rem)] min-h-[540px]">
        {/* Header */}
        <header className="mb-4 mt-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Messages</h1>
            <p className="text-sm text-gray-600 mt-1">
              Chat with your clients and collaborators in real time.
            </p>
          </div>
        </header>

        {/* Main layout: resizable two-column on md+, stacked on mobile */}
        <div ref={containerRef} className="flex flex-col md:flex-row gap-0 flex-1 min-h-0">
          {/* Conversations list */}
          <div className={`flex min-h-0 ${selected ? 'hidden md:flex' : 'flex'}`} style={{ ...(isDesktop ? { width: leftWidth } : { width: '100%' }) }}>
            <Card
              hover={false}
              className="relative flex flex-col w-full h-80 md:h-full min-h-0"
              style={{ transition: 'none' }}
            >
              {/* Search header */}
              <div className="p-3 sm:p-4 border-b border-gray-100">
                <div className="relative">
                  <input
                    className="w-full px-3 pr-10 py-2 rounded-full border bg-white text-sm focus:outline-none"
                    placeholder="Search or start a new chat"
                    aria-label="Search conversations"
                  />
                  <div className="absolute right-3 top-3 text-gray-400">
                    <Search size={16} />
                  </div>
                </div>
              </div>

              {/* Chat list - scrollable flex-1 */}
              <div className="flex-1 divide-y overflow-y-auto min-h-0 scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
                {convs.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelected(c.id)}
                    className={`w-full text-left py-3 px-2 flex items-center gap-3 ${selected === c.id
                      ? 'bg-primary-50/70 rounded-md'
                      : 'hover:bg-gray-50'
                      } transition-colors`}
                  >
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700">
                      {initials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-gray-900 truncate">
                          {c.name}
                        </div>
                        <div className="text-[11px] text-gray-400 ml-2">
                          {c.time}
                        </div>
                      </div>
                      <div className="text-xs text-gray-600 truncate mt-0.5">
                        {c.lastMessage}
                      </div>
                    </div>
                    {c.unread > 0 && (
                      <div className="ml-2 flex-shrink-0">
                        <div className="bg-primary-600 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                          {c.unread}
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Professional New Chat Button - Sticky at bottom */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <button className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white rounded-xl font-medium shadow-md hover:shadow-lg transition-all duration-200 group">
                  <Plus size={18} className="group-hover:rotate-90 transition-transform duration-200" />
                  <span className="text-sm">New Conversation</span>
                </button>
              </div>
            </Card>
          </div>

          {/* resizer: invisible but interactive handle (desktop only) */}
          <div
            className="hidden md:flex items-stretch"
            style={{ width: 8, cursor: isResizing ? 'col-resize' : 'col-resize' }}
            onMouseDown={(e) => { if (isDesktop) startResize(e.clientX); }}
            onTouchStart={(e) => { if (isDesktop) startResize(e.touches[0].clientX); }}
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize conversations pane"
          />

          {/* Chat thread / fallback */}
          <div className={`flex-1 flex flex-col min-h-0 ${selected ? 'flex' : 'hidden md:flex'}`}>
            <Card
              hover={false}
              className="flex-1 flex flex-col p-0 overflow-hidden h-full min-h-0"
              style={{ transition: 'none' }}
            >
              {/* If no conversation selected – fallback (desktop only, mobile already shows list) */}
              {!activeConv ? (
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-white text-center px-6">
                  <img
                    src="/src/assets/chat-empty.jpg"
                    alt="Start chatting"
                    className="w-56 h-56 sm:w-64 sm:h-64 object-cover mb-6 rounded-2xl shadow-lg"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">
                    Turn conversations into opportunities.
                  </h2>
                  <p className="text-sm text-gray-600 max-w-md mb-4">
                    Start a conversation to discuss project requirements, updates, or payments.
                  </p>
                </div>
              ) : (
                <>
                  {/* Chat header */}
                  <div className="flex items-center justify-between px-4 py-3 border-b bg-white">
                    <div className="flex items-center gap-3">
                      {/* Back button on mobile only */}
                      <button
                        className="mr-1 md:hidden p-1 rounded-full hover:bg-gray-100"
                        onClick={() => setSelected(null)}
                      >
                        <ArrowLeft size={18} />
                      </button>

                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-700 ml-1">
                        {initials(activeConv.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">
                          {activeConv.name}
                        </div>
                        <div className="text-[11px] text-gray-500 flex items-center gap-2">
                          {(() => {
                            // If last message in this conversation is marked 'Now', treat as active
                            const convMsgs = allMessages[selected] || [];
                            const lastMsg = convMsgs[convMsgs.length - 1];
                            if (lastMsg && lastMsg.time === 'Now') {
                              return (
                                <>
                                  <span className="inline-block w-2 h-2 rounded-full bg-green-500" />
                                  <span>Active</span>
                                </>
                              );
                            }
                            // otherwise show last seen using the conversation time (mock data)
                            return <span>Last seen {activeConv.time}</span>;
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mr-1">
                      <button
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Voice call"
                        aria-label="Voice call"
                      >
                        <img src="/src/assets/phone-call-svgrepo-com.svg" alt="voice call" className="w-5 h-5" />
                      </button>

                      <button
                        className="p-2 rounded-md hover:bg-gray-100"
                        title="Video call"
                        aria-label="Video call"
                      >
                        <img src="/src/assets/video-call-svgrepo-com.svg" alt="video call" className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Messages area – WhatsApp-like bubbles */}
                  <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-3 space-y-3 bg-gray-50 min-h-0 scrollbar-thin" style={{ WebkitOverflowScrolling: 'touch' }}>
                    <div className="flex items-center justify-center text-[11px] text-gray-400 my-1">
                      <span className="px-3 py-0.5 bg-gray-200 rounded-full">
                        Today
                      </span>
                    </div>

                    {messages.map((m) => (
                      <div
                        key={m.id}
                        className={`flex items-end ${m.fromMe ? 'justify-end' : 'justify-start'
                          }`}
                      >

                        <div
                          className={`max-w-[75%] sm:max-w-[70%] px-3 py-2 rounded-2xl text-sm shadow-sm ${m.fromMe
                            ? 'bg-primary-600 text-white rounded-br-sm'
                            : 'bg-white text-gray-900 rounded-bl-sm'
                            }`}
                        >
                          <div>{m.text}</div>
                          <div
                            className={`text-[10px] mt-1 text-right ${m.fromMe ? 'text-white/80' : 'text-gray-500'
                              }`}
                          >
                            {m.time}
                          </div>
                        </div>

                        {m.fromMe && <div className="w-7 h-7 ml-2" />}
                      </div>
                    ))}
                  </div>

                  {/* Composer */}
                  <div className="border-t px-3 sm:px-4 py-2.5 bg-white">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="p-2 text-gray-600 hover:text-gray-900 rounded-md"
                      >
                        <Paperclip size={18} />
                      </button>
                      <input ref={fileRef} type="file" className="hidden" />
                      <button className="p-2 text-gray-600 hover:text-gray-900 rounded-md">
                        <Smile size={18} />
                      </button>
                      <input
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Type a message"
                        className="flex-1 px-3 py-2 rounded-full border bg-white text-sm focus:outline-none"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSend();
                          }
                        }}
                      />
                      <Button onClick={handleSend}>
                        <Send size={16} />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Messages;
