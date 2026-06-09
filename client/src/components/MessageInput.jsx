import React, { useState, useRef, useEffect } from 'react';
import { Smile, Send, Paperclip } from 'lucide-react';

const EMOJIS = ['😀', '😂', '😍', '👍', '🔥', '🎉', '❤️', '👏', '🙏', '🙌', '✨', '😎', '💡', '😢', '😡', '👀', '💯', '🚀', '⭐', '✔️'];

const MessageInput = ({
  onSendMessage,
  onTypingStart,
  onTypingStop
}) => {
  const [messageText, setMessageText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const inputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimerRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  // Close emoji picker when clicking outside of it
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessageText(val);

    // Trigger typing socket start
    if (!isTyping && val.trim().length > 0) {
      setIsTyping(true);
      onTypingStart();
    }

    // Debounce typing stop
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    
    typingTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      onTypingStop();
    }, 2000);
  };

  const handleSend = (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;

    onSendMessage(messageText.trim());
    setMessageText('');

    // Force stop typing on send
    if (typingTimerRef.current) clearTimeout(typingTimerRef.current);
    setIsTyping(false);
    onTypingStop();
    
    // Maintain input focus
    inputRef.current?.focus();
  };

  const handleEmojiClick = (emoji) => {
    setMessageText((prev) => prev + emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  return (
    <div className="px-4 py-2.5 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800/40 flex items-center gap-3 relative flex-shrink-0 z-20 h-[64px] select-none backdrop-blur-md">
      
      {/* Sleek Native Emoji Popover */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-18 left-4 p-3 bg-white dark:bg-[#1a2333] border border-slate-150 dark:border-slate-800/60 shadow-xl rounded-2xl w-64 grid grid-cols-5 gap-2 z-50 animate-fade-in"
        >
          {EMOJIS.map((emoji, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleEmojiClick(emoji)}
              className="text-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all active:scale-90"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input Form Bar - Flush Edge-to-Edge Container */}
      <form onSubmit={handleSend} className="flex items-center gap-3.5 w-full bg-transparent">
        
        {/* Emoji Button */}
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`p-2 rounded-xl transition-all hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-95 ${
            showEmojiPicker
              ? 'text-brand-500'
              : 'text-slate-400 dark:text-slate-500'
          }`}
          title="Add Emoji"
        >
          <Smile className="w-[20px] h-[20px]" />
        </button>

        {/* Attachment Pin Icon (Placeholder for files) */}
        <button
          type="button"
          className="p-2 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-all cursor-not-allowed opacity-35"
          title="File attachments (Coming soon)"
        >
          <Paperclip className="w-[20px] h-[20px]" />
        </button>

        {/* Main Chat Input Field - Inner Typing Capsule */}
        <div className="flex-1 bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 focus-within:border-brand-500/50 focus-within:ring-2 focus-within:ring-brand-500/10 rounded-xl px-4 py-1.8 flex items-center h-[40px] transition-all duration-200 shadow-inner">
          <input
            ref={inputRef}
            type="text"
            value={messageText}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="w-full bg-transparent border-none outline-none text-[14px] text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none py-1"
          />
        </div>

        {/* Send Button */}
        <button
          type="submit"
          disabled={!messageText.trim()}
          className={`p-2 rounded-xl flex items-center justify-center flex-shrink-0 w-[40px] h-[40px] transition-all duration-200 ${
            messageText.trim()
              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/10 active:scale-[0.95]'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-[18px] h-[18px] fill-current" />
        </button>

      </form>

    </div>
  );
};

export default MessageInput;
