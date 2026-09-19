import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';
import { Send, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';

export const ChatWidget = ({ messages = [] }) => {
  const { sendChatMessage } = useSocket();
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    const msg = text;
    setText('');
    try {
      await sendChatMessage(msg);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-full max-h-[500px]">
      {/* Header */}
      <div
        className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between cursor-pointer select-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-purple-400" />
          <span className="font-bold text-sm text-slate-200">Room Chat</span>
          <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
            {messages.length}
          </span>
        </div>
        <button className="text-slate-400 hover:text-white">
          {isOpen ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </button>
      </div>

      {/* Message List */}
      {isOpen && (
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-3.5 min-h-[220px]">
            {messages.length === 0 ? (
              <div className="text-center text-xs text-slate-500 py-8 italic">
                No messages yet. Say hello to your friends! 👋
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id || Math.random()} className="flex flex-col text-xs">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span
                      className="font-bold text-slate-200 truncate"
                      style={{ color: msg.senderColor || '#A78BFA' }}
                    >
                      {msg.senderName}
                    </span>
                    <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                  </div>
                  <div className="bg-slate-800/80 text-slate-200 p-2 rounded-xl rounded-tl-none border border-slate-700/50 break-words leading-relaxed">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-slate-800 bg-slate-950/50 flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send message..."
              maxLength={200}
              className="flex-1 bg-slate-900 text-slate-200 text-xs px-3 py-2 rounded-xl border border-slate-700/60 focus:outline-none focus:border-purple-500"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:bg-slate-800 disabled:text-slate-600 text-white p-2 rounded-xl transition-colors shadow-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
