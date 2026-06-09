import React, { useEffect, useRef } from 'react';
import MessageBubble from './MessageBubble.jsx';
import { formatDate } from '../utils/formatters.js';

const ChatMessages = ({
  messages,
  currentUserId,
  isTyping
}) => {
  const bottomRef = useRef(null);

  // Smooth scroll to bottom whenever messages or typing status updates
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center wa-chat-bg">
        <div className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-[11.5px] text-center max-w-[350px] px-3.5 py-2.5 rounded-xl leading-relaxed mb-6">
          🔒 Messages are secured with end-to-end encryption. No one outside of this chat can read or listen to them.
        </div>
        <div className="bg-white dark:bg-slate-900 px-6 py-5 rounded-2xl max-w-[280px] border border-slate-100 dark:border-slate-800/60 shadow-sm">
          <h5 className="font-semibold text-[14px] mb-1.5 text-slate-700 dark:text-slate-200">No message history yet</h5>
          <p className="text-[12.5px] text-slate-400 dark:text-slate-500 leading-relaxed">
            Type your first message below to start chatting.
          </p>
        </div>
      </div>
    );
  }

  // Inject date separators dynamically
  const renderMessageContent = () => {
    const elements = [];
    
    // Inject privacy banner at the very top of message history
    elements.push(
      <div key="encryption-banner" className="flex justify-center mb-6 mt-1 select-none">
        <div className="bg-slate-100 dark:bg-slate-800/40 border border-slate-200/30 dark:border-slate-800/50 text-slate-500 dark:text-slate-400 text-[11px] text-center max-w-[350px] px-3.5 py-1.8 rounded-xl leading-relaxed">
          🔒 Messages are secured with end-to-end encryption. No one outside of this chat can read or listen to them.
        </div>
      </div>
    );

    let lastDateString = null;

    messages.forEach((msg, idx) => {
      const msgDate = new Date(msg.createdAt);
      const currentDateString = msgDate.toDateString();

      // Render a date separator if day shifts
      if (currentDateString !== lastDateString) {
        lastDateString = currentDateString;
        elements.push(
          <div key={`sep-${msg.id || idx}`} className="flex justify-center my-4 select-none">
            <span className="px-3.5 py-1 text-[10.5px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/20 dark:border-slate-700/10">
              {formatDate(msg.createdAt)}
            </span>
          </div>
        );
      }

      elements.push(
        <MessageBubble
          key={msg.id || `msg-${idx}`}
          message={msg}
          isOwnMessage={msg.senderId === currentUserId}
        />
      );
    });

    return elements;
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-6 wa-chat-bg flex flex-col">
      {renderMessageContent()}
      
      {/* Target anchor to trigger smooth auto scroll */}
      <div ref={bottomRef} />
    </div>
  );
};

export default ChatMessages;
