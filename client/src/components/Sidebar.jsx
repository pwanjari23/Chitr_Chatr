import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';
import { SocketContext } from '../context/SocketContext.jsx';
import api from '../services/api.js';
import UserCard from './UserCard.jsx';
import { LogOut, Sun, Moon, Search, MessageSquare, ShieldAlert, SquarePen, Users, User, Phone } from 'lucide-react';

const Sidebar = ({
  activeConversation,
  setActiveConversation,
  conversations,
  setConversations,
  typingStatus,
  onStartNewChat
}) => {
  const { user, logout } = useContext(AuthContext);
  const { onlineUsers } = useContext(SocketContext);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [theme, setTheme] = useState(document.documentElement.classList.contains('dark') ? 'dark' : 'light');

  // Sync / apply theme selection
  const toggleTheme = () => {
    if (theme === 'dark') {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setTheme('light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setTheme('dark');
    }
  };

  // Perform search on query change
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        setIsSearching(true);
        try {
          const res = await api.get(`/users?search=${encodeURIComponent(searchQuery)}`);
          if (res.data.success) {
            setSearchResults(res.data.users);
          }
        } catch (err) {
          console.error('Failed to search users:', err);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleSearchResultClick = async (clickedUser) => {
    console.log('Search result contact tile clicked:', clickedUser);
    setSearchQuery('');
    setSearchResults([]);
    onStartNewChat(clickedUser);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800/60 w-full md:w-[400px] flex-shrink-0">
      
      {/* Sidebar Header / User Profile Block */}
      <div className="flex items-center justify-between p-3 px-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800/40 h-[64px] backdrop-blur-md flex-shrink-0">
        <div className="flex items-center gap-3">
          <img
            src={user?.profilePic || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || '')}&radius=50`}
            alt="My Avatar"
            className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800 shadow-sm"
          />
          <div className="min-w-0">
            <h3 className="font-semibold text-[14.5px] text-slate-800 dark:text-slate-100 truncate">
              {user?.name}
            </h3>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
          {/* Light/Dark Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl transition-all duration-200"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4.5 h-4.5 text-amber-500" /> : <Moon className="w-4.5 h-4.5" />}
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="p-2 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 rounded-xl transition-all duration-200"
            title="Logout"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Modern Search Field */}
      <div className="p-3 bg-white dark:bg-slate-900 border-b border-slate-100/50 dark:border-slate-800/30">
        <div className="relative flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800/60 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-xl px-3 py-1.8 w-full transition-all duration-200">
          <Search className="w-4 h-4 text-slate-400 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search or start new chat"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-[13.5px] bg-transparent border-none outline-none text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
          />
        </div>
      </div>

      {/* Conversations / Search Results Listing Viewport */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-slate-900">
        {searchQuery.trim().length > 0 ? (
          /* Render User Discovery Search Results */
          <div>
            <div className="px-5 py-2 text-[11px] font-bold text-brand-500 uppercase tracking-wider bg-white dark:bg-slate-900 border-b border-slate-100/50 dark:border-slate-800/30">
              Search Results
            </div>
            {isSearching ? (
              <div className="flex items-center justify-center p-6 space-x-2">
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce dot-1"></span>
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce dot-2"></span>
                <span className="w-2 h-2 bg-brand-500 rounded-full animate-bounce dot-3"></span>
              </div>
            ) : searchResults.length > 0 ? (
              searchResults.map((searchUser) => (
                <UserCard
                  key={searchUser.id}
                  user={searchUser}
                  isOnline={onlineUsers.includes(searchUser.id)}
                  onClick={() => handleSearchResultClick(searchUser)}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900">
                <ShieldAlert className="w-7 h-7 text-slate-400 mb-2 stroke-[1.5]" />
                <span className="text-[12px] text-slate-500 dark:text-slate-400">No matching contacts found</span>
              </div>
            )}
          </div>
        ) : (
          /* Render Active Chat Threads list */
          <div>
            <div className="px-5 py-2 text-[11px] font-bold text-brand-500 uppercase tracking-wider bg-white dark:bg-slate-900 border-b border-slate-100/50 dark:border-slate-800/30 flex items-center justify-between">
              <span>Conversations</span>
              <MessageSquare className="w-3.5 h-3.5 opacity-40" />
            </div>
            {conversations.length > 0 ? (
              conversations.map((convo) => {
                const isUserTyping = typingStatus[convo.conversationId] || false;
                const isUserOnline = onlineUsers.includes(convo.otherUser.id);
                
                return (
                  <UserCard
                    key={convo.conversationId}
                    user={convo.otherUser}
                    lastMessage={convo.lastMessage}
                    unreadCount={convo.unreadCount}
                    isOnline={isUserOnline}
                    isTyping={isUserTyping}
                    isActive={activeConversation?.conversationId === convo.conversationId}
                    onClick={() => {
                      console.log('Sidebar active conversation tile clicked:', convo);
                      setActiveConversation(convo);
                    }}
                  />
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900">
                <MessageSquare className="w-10 h-10 stroke-[1.2] text-slate-400 opacity-40 mb-3" />
                <h5 className="font-semibold text-[13.5px] mb-1 text-slate-700 dark:text-slate-300">Your inbox is empty</h5>
                <p className="text-[12px] text-slate-400 dark:text-slate-500 max-w-[200px] leading-relaxed">
                  Search for friends by name using the search bar above to start typing.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default Sidebar;
