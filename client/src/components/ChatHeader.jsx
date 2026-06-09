import React, { useContext } from 'react';
import { SocketContext } from '../context/SocketContext.jsx';
import { ArrowLeft, Phone, Video, Info, MoreVertical } from 'lucide-react';

const ChatHeader = ({
  otherUser,
  isTyping,
  onBackClick
}) => {
  const { onlineUsers } = useContext(SocketContext);
  const isOnline = onlineUsers.includes(otherUser.id);

  return (
    <div className="flex items-center justify-between px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/40 h-[64px] z-10 flex-shrink-0 select-none backdrop-blur-md">
      
      {/* User Information & Mobile Back Button */}
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Back Arrow for Mobile View */}
        <button
          onClick={onBackClick}
          className="md:hidden p-1.5 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all mr-1"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        {/* Recipient Profile Avatar */}
        <div className="relative flex-shrink-0">
          <img
            src={otherUser.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(otherUser.name)}&radius=50`}
            alt={otherUser.name}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
          />
          {isOnline && (
            <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"></span>
          )}
        </div>

        {/* Username and Connection Status Details */}
        <div className="min-w-0">
          <h4 className="text-[14.5px] font-semibold text-slate-800 dark:text-slate-100 truncate leading-tight">
            {otherUser.name}
          </h4>
          <p className="text-[12px] text-slate-400 dark:text-slate-500 truncate mt-0.5 font-medium">
            {isTyping ? (
              <span className="text-brand-500 dark:text-brand-400 font-semibold animate-pulse">
                typing...
              </span>
            ) : isOnline ? (
              <span className="text-brand-500 font-semibold">online</span>
            ) : (
              <span>offline</span>
            )}
          </p>
        </div>
      </div>

      {/* Decorative Interactive Tools */}
      <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all cursor-not-allowed opacity-30" title="Voice call (Coming soon)">
          <Phone className="w-4.5 h-4.5" />
        </button>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all cursor-not-allowed opacity-30" title="Video call (Coming soon)">
          <Video className="w-4.5 h-4.5" />
        </button>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all cursor-not-allowed opacity-30" title="Chat Info">
          <Info className="w-4.5 h-4.5" />
        </button>
        <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all cursor-not-allowed opacity-30">
          <MoreVertical className="w-4.5 h-4.5" />
        </button>
      </div>

    </div>
  );
};

export default ChatHeader;
