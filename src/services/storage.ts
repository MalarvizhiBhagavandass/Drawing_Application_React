import { openDB } from 'idb';
import { ChatState } from '../types';

const DB_NAME = 'trading-ai-chat-db';
const DB_VERSION = 1;
const STORE_NAME = 'chat-state';
const STATE_KEY = 'app-state';

export const initDB = async () => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      db.createObjectStore(STORE_NAME);
    },
  });
};

export const saveState = async (state: ChatState): Promise<void> => {
  try {
    const db = await initDB();
    await db.put(STORE_NAME, state, STATE_KEY);
  } catch (error) {
    console.error('Error saving state to IndexedDB:', error);
    localStorage.setItem('trading-ai-chat-state', JSON.stringify(state));
  }
};

export const loadState = async (): Promise<ChatState | null> => {
  try {
    const db = await initDB();
    const state = await db.get(STORE_NAME, STATE_KEY);
    return state || null;
  } catch (error) {
    console.error('Error loading state from IndexedDB:', error);
    const storedState = localStorage.getItem('trading-ai-chat-state');
    return storedState ? JSON.parse(storedState) : null;
  }
};

export const clearState = async (): Promise<void> => {
  try {
    const db = await initDB();
    await db.delete(STORE_NAME, STATE_KEY);
    localStorage.removeItem('trading-ai-chat-state');
  } catch (error) {
    console.error('Error clearing state:', error);
  }
};