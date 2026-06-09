import React from 'react';

const TypingIndicator = () => {
  return (
    <div className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 dark:bg-slate-800 rounded-2xl w-max max-w-[80px]">
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full dot-1"></span>
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full dot-2"></span>
      <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full dot-3"></span>
    </div>
  );
};

export default TypingIndicator;
