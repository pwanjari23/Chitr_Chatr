/**
 * Formats an ISO timestamp into a user-friendly time string (e.g., "09:30 AM")
 * @param {string} timestamp 
 * @returns {string}
 */
export const formatTime = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Formats an ISO timestamp into a user-friendly chat header date (e.g., "Today", "Yesterday", "May 27, 2026")
 * @param {string} timestamp 
 * @returns {string}
 */
export const formatDate = (timestamp) => {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  } else if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  }
};

/**
 * Truncates long string previews
 * @param {string} text 
 * @param {number} limit 
 * @returns {string}
 */
export const truncateText = (text, limit = 32) => {
  if (!text) return '';
  if (text.length <= limit) return text;
  return text.slice(0, limit) + '...';
};
