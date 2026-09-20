import React, { useState, useRef, useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export const ChatWidget = ({ messages = [] }) => {
  const { sendChatMessage } = useSocket();
  const [text, setText] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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
    <div className="term-box flex flex-col h-full max-h-[500px] font-mono text-xs">
      {/* Header */}
      <div
        className="px-3 py-2 border-b border-[var(--border)] flex items-center justify-between cursor-pointer select-none bg-[var(--bg)]"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-[var(--accent)]">[ CHAT LOG // ROOM ]</span>
          <span className="text-[10px] opacity-70">({messages.length})</span>
        </div>
        <button className="text-xs font-bold hover:text-[var(--accent)]">
          [{isOpen ? '−' : '+'}]
        </button>
      </div>

      {/* Messages */}
      {isOpen && (
        <>
          <div className="flex-1 p-3 overflow-y-auto space-y-2 min-h-[220px]">
            {messages.length === 0 ? (
              <div className="text-center text-[10px] opacity-50 py-8">
                // NO MESSAGES LOGGED. TYPE TO CHAT.
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id || Math.random()} className="flex flex-col text-xs border-l-2 border-[var(--border)] pl-2 py-0.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-[var(--accent)]">
                      &gt; {msg.senderName}
                    </span>
                    <span className="text-[9px] opacity-60">{msg.timestamp}</span>
                  </div>
                  <div className="text-[var(--text)] break-words leading-tight mt-0.5">
                    {msg.text}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-2 border-t border-[var(--border)] bg-[var(--bg)] flex gap-2">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="TYPE MESSAGE..."
              maxLength={200}
              className="flex-1 bg-[var(--panel-bg)] text-[var(--text)] text-xs px-2.5 py-1.5 border border-[var(--border)] focus:outline-none focus:border-[var(--text)]"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="term-button px-3 py-1.5 text-xs font-bold"
            >
              [SEND]
            </button>
          </form>
        </>
      )}
    </div>
  );
};
