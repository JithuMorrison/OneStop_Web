/**
 * Chat Service
 * Handles all chat-related API calls to the MongoDB backend
 */

const API_URL = 'http://localhost:5000/api';

/**
 * Get authentication headers with JWT token
 * @returns {Object} Headers object with Authorization
 */
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

/**
 * Create or get existing chat thread with a user
 * @param {string} userId - ID of the user to chat with
 * @returns {Promise<Object>} Chat thread object
 */
export const createChatThread = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/chat/${userId}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to create chat thread');
    }

    const chat = await response.json();
    return chat;
  } catch (error) {
    console.error('Error creating chat thread:', error);
    throw error;
  }
};

/**
 * Send a message in a chat thread
 * @param {string} chatId - ID of the chat thread
 * @param {string} content - Message content
 * @returns {Promise<Object>} Updated chat object
 */
export const sendMessage = async (chatId, content) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}/message`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error('Failed to send message');
    }

    const chat = await response.json();
    return chat;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

/**
 * Get messages for a specific chat thread
 * @param {string} chatId - ID of the chat thread
 * @returns {Promise<Object>} Chat object with populated messages
 */
export const getChatMessages = async (chatId) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}/messages`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get messages');
    }

    const chat = await response.json();
    return chat;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw error;
  }
};

/**
 * Get all chat threads for the current user
 * @returns {Promise<Array>} Array of chat thread objects
 */
export const getChatThreads = async () => {
  try {
    const response = await fetch(`${API_URL}/chats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to get chat threads');
    }

    const chats = await response.json();
    return chats;
  } catch (error) {
    console.error('Error getting chat threads:', error);
    throw error;
  }
};

/**
 * Poll for new messages in a chat thread
 * This implements a simple polling mechanism for real-time updates
 * @param {string} chatId - ID of the chat thread
 * @param {Function} callback - Callback function to handle new messages
 * @param {number} interval - Polling interval in milliseconds (default: 3000)
 * @returns {Function} Cleanup function to stop polling
 */
export const pollMessages = (chatId, callback, interval = 3000) => {
  let lastMessageCount = 0;
  
  const poll = async () => {
    try {
      const chat = await getChatMessages(chatId);
      const currentMessageCount = chat.messages?.length || 0;
      
      // If there are new messages, call the callback
      if (currentMessageCount > lastMessageCount) {
        callback(chat.messages);
        lastMessageCount = currentMessageCount;
      }
    } catch (error) {
      console.error('Error polling messages:', error);
    }
  };

  // Initial poll
  poll();
  
  // Set up interval
  const intervalId = setInterval(poll, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Poll for new chat threads
 * This implements a simple polling mechanism for real-time chat list updates
 * @param {Function} callback - Callback function to handle updated chat list
 * @param {number} interval - Polling interval in milliseconds (default: 5000)
 * @returns {Function} Cleanup function to stop polling
 */
export const pollChatThreads = (callback, interval = 5000) => {
  const poll = async () => {
    try {
      const chats = await getChatThreads();
      callback(chats);
    } catch (error) {
      console.error('Error polling chat threads:', error);
    }
  };

  // Initial poll
  poll();
  
  // Set up interval
  const intervalId = setInterval(poll, interval);
  
  // Return cleanup function
  return () => clearInterval(intervalId);
};

/**
 * Edit a message in a chat thread
 * @param {string} chatId - ID of the chat thread
 * @param {string} messageId - ID of the message to edit
 * @param {string} content - New message content
 * @returns {Promise<Object>} Updated message object
 */
export const editMessage = async (chatId, messageId, content) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}/message/${messageId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });

    if (!response.ok) {
      throw new Error('Failed to edit message');
    }

    const message = await response.json();
    return message;
  } catch (error) {
    console.error('Error editing message:', error);
    throw error;
  }
};

/**
 * Delete a message from a chat thread
 * @param {string} chatId - ID of the chat thread
 * @param {string} messageId - ID of the message to delete
 * @returns {Promise<Object>} Success response
 */
export const deleteMessage = async (chatId, messageId) => {
  try {
    const response = await fetch(`${API_URL}/chat/${chatId}/message/${messageId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error('Failed to delete message');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

export default {
  createChatThread,
  sendMessage,
  editMessage,
  deleteMessage,
  getChatMessages,
  getChatThreads,
  pollMessages,
  pollChatThreads
};
