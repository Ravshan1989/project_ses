import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DAILY_REPORTS: '@daily_reports',
  EXEC_SUMMARY: '@exec_summary',
  SYNC_QUEUE: '@sync_queue',
};

export interface OfflineReport {
  id: string;
  type: string;
  data: any;
  timestamp: number;
}

export const offlineStorage = {
  // Generic save/get
  save: async (key: string, data: any) => {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
      console.error('Offline storage save error', e);
    }
  },

  get: async (key: string) => {
    try {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Offline storage get error', e);
      return null;
    }
  },

  // Specialized methods
  saveDailyReports: (data: any) => offlineStorage.save(STORAGE_KEYS.DAILY_REPORTS, data),
  getDailyReports: () => offlineStorage.get(STORAGE_KEYS.DAILY_REPORTS),

  saveReport: async (type: string, data: any) => {
    const queue = (await offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE)) || [];
    queue.push({
      id: Math.random().toString(36).substring(7),
      type,
      data,
      timestamp: Date.now()
    });
    await offlineStorage.save(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  getQueueSize: async () => {
    const queue = await offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE);
    return queue ? queue.length : 0;
  },

  getQueue: () => offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE),

  removeReport: async (id: string) => {
    const queue = (await offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE)) || [];
    const newQueue = queue.filter((r: any) => r.id !== id);
    await offlineStorage.save(STORAGE_KEYS.SYNC_QUEUE, newQueue);
  },

  addToSyncQueue: async (request: { url: string; method: string; data: any; timestamp: number }) => {
    const queue = (await offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE)) || [];
    queue.push(request);
    await offlineStorage.save(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  getSyncQueue: () => offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE),
  clearSyncQueue: () => AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
};
