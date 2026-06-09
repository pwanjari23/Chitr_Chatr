import React from 'react';
import { formatTime, truncateText } from '../utils/formatters.js';
import { Check, CheckCheck } from 'lucide-react';

const UserCard = ({
  user,
  lastMessage,
  unreadCount,
  isOnline,
  isActive,
  isTyping,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 px-4.5 cursor-pointer select-none border-b border-slate-100/50 dark:border-slate-800/30 chat-transition ${
        isActive
          ? 'saas-active-item'
          : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/20 text-slate-700 dark:text-slate-200'
      }`}
    >
      {/* Avatar Container with Online Indicator */}
      <div className="relative flex-shrink-0">
        <img
          src={user.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&radius=50`}
          alt={user.name}
          className="w-[48px] h-[48px] rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800/60 shadow-sm"
        />
        {isOnline && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></span>
        )}
      </div>

      {/* Details Area */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-baseline mb-1">
          <h4 className="text-[14.5px] font-semibold truncate text-slate-800 dark:text-slate-150">
            {user.name}
          </h4>
          {lastMessage && (
            <span className="text-[11.5px] text-slate-400 dark:text-slate-500 font-medium">
              {formatTime(lastMessage.createdAt)}
            </span>
          )}
        </div>

        <div className="flex justify-between items-center">
          {/* Last message or typing state */}
          <div className="text-[12.5px] truncate flex items-center gap-1 text-slate-400 dark:text-slate-500">
            {isTyping ? (
              <span className="text-brand-500 dark:text-brand-400 font-semibold italic">
                typing...
              </span>
            ) : lastMessage ? (
              <>
                {/* Tick indicator if current user sent the last message */}
                {lastMessage.senderId !== user.id && (
                  <span>
                    {lastMessage.seen ? (
                      <CheckCheck className="w-4 h-4 text-brand-500" />
                    ) : (
                      <Check className="w-4 h-4 text-slate-300 dark:text-slate-600" />
                    )}
                  </span>
                )}
                <span className="truncate text-slate-500 dark:text-slate-400">{truncateText(lastMessage.message, 30)}</span>
              </>
            ) : (
              <span className="italic opacity-60">No messages yet</span>
            )}
          </div>

          {/* Unread count badge */}
          {unreadCount > 0 && !isActive && (
            <span className="flex items-center justify-center w-4.5 h-4.5 text-[10px] font-bold text-white bg-brand-500 rounded-full flex-shrink-0 shadow-md shadow-brand-500/10">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserCard;
