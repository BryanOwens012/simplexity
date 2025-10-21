import type { Conversation, Message } from './types';

const STORAGE_KEY = 'simplexity-conversations';
const CURRENT_CONVERSATION_KEY = 'simplexity-current-conversation';

// Generate a unique ID
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

// Get all conversations from sessionStorage
export const getAllConversations = (): Conversation[] => {
  if (typeof window === 'undefined') return [];

  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading conversations from sessionStorage:', error);
    return [];
  }
};

// Get a specific conversation by ID
export const getConversation = (id: string): Conversation | null => {
  const conversations = getAllConversations();
  return conversations.find((conv) => conv.id === id) || null;
};

// Get the current active conversation ID
export const getCurrentConversationId = (): string | null => {
  if (typeof window === 'undefined') return null;

  try {
    return sessionStorage.getItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Error reading current conversation ID:', error);
    return null;
  }
};

// Set the current active conversation ID
export const setCurrentConversationId = (id: string): void => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(CURRENT_CONVERSATION_KEY, id);
  } catch (error) {
    console.error('Error setting current conversation ID:', error);
  }
};

// Create a new conversation
export const createConversation = (): Conversation => {
  const newConversation: Conversation = {
    id: generateId(),
    messages: [],
    createdAt: Date.now(),
  };

  const conversations = getAllConversations();
  conversations.push(newConversation);
  saveAllConversations(conversations);
  setCurrentConversationId(newConversation.id);

  return newConversation;
};

// Save all conversations to sessionStorage
export const saveAllConversations = (conversations: Conversation[]): void => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
  } catch (error) {
    console.error('Error saving conversations to sessionStorage:', error);
  }
};

// Update a conversation
export const updateConversation = (updatedConversation: Conversation): void => {
  const conversations = getAllConversations();
  const index = conversations.findIndex((conv) => conv.id === updatedConversation.id);

  if (index !== -1) {
    conversations[index] = updatedConversation;
    saveAllConversations(conversations);
  }
};

// Add a message to a conversation
export const addMessage = (conversationId: string, message: Message): void => {
  const conversation = getConversation(conversationId);

  if (conversation) {
    conversation.messages.push(message);
    updateConversation(conversation);
  }
};

// Update a message in a conversation
export const updateMessage = (conversationId: string, messageId: string, updates: Partial<Message>): void => {
  const conversation = getConversation(conversationId);

  if (conversation) {
    const messageIndex = conversation.messages.findIndex((msg) => msg.id === messageId);

    if (messageIndex !== -1) {
      conversation.messages[messageIndex] = {
        ...conversation.messages[messageIndex],
        ...updates,
      };
      updateConversation(conversation);
    }
  }
};

// Delete a conversation
export const deleteConversation = (id: string): void => {
  const conversations = getAllConversations();
  const filtered = conversations.filter((conv) => conv.id !== id);
  saveAllConversations(filtered);

  // If we deleted the current conversation, clear the current ID
  if (getCurrentConversationId() === id) {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  }
};

// Get or create current conversation
export const getOrCreateCurrentConversation = (): Conversation => {
  const currentId = getCurrentConversationId();

  if (currentId) {
    const conversation = getConversation(currentId);
    if (conversation) {
      return conversation;
    }
  }

  // No current conversation, create a new one
  return createConversation();
};

// Clear all conversations (useful for testing or reset)
export const clearAllConversations = (): void => {
  if (typeof window === 'undefined') return;

  try {
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(CURRENT_CONVERSATION_KEY);
  } catch (error) {
    console.error('Error clearing conversations:', error);
  }
};
