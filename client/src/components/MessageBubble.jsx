import React from 'react';
import { formatTime } from '../utils/formatters.js';
import { Check, CheckCheck } from 'lucide-react';

const MessageBubble = ({
  message,
  isOwnMessage
}) => {
  return (
    <div className={`flex flex-col mb-2 max-w-[75%] ${isOwnMessage ? 'self-end items-end' : 'self-start items-start'}`}>
      
      {/* Message Text Bubble */}
      <div
        className={`px-4 py-2 text-[13.5px] select-text break-words leading-relaxed whitespace-pre-wrap relative pr-14 pb-2.5 ${
          isOwnMessage
            ? 'saas-bubble-sent'
            : 'saas-bubble-received'
        }`}
      >
        <span>{message.message}</span>
        
        {/* Timestamp and Seen Indicator Row inside bubble */}
        <div className={`absolute bottom-1 right-2 flex items-center gap-1 text-[9.5px] select-none pointer-events-none ${
          isOwnMessage
            ? 'text-white/60'
            : 'text-slate-400 dark:text-slate-500'
        }`}>
          <span>{formatTime(message.createdAt)}</span>
          {isOwnMessage && (
            <span className="flex-shrink-0">
              {message.seen ? (
                <CheckCheck className="w-3.5 h-3.5 text-white" />
              ) : (
                <Check className="w-3.5 h-3.5 text-white/50" />
              )}
            </span>
          )}
        </div>
      </div>

    </div>
  );
};

export default MessageBubble;
