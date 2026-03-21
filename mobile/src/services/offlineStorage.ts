import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  DAILY_REPORTS: '@daily_reports',
  EXEC_SUMMARY: '@exec_summary',
  SYNC_QUEUE: '@sync_queue',
};

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

  addToSyncQueue: async (request: { url: string; method: string; data: any; timestamp: number }) => {
    const queue = (await offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE)) || [];
    queue.push(request);
    await offlineStorage.save(STORAGE_KEYS.SYNC_QUEUE, queue);
  },

  getSyncQueue: () => offlineStorage.get(STORAGE_KEYS.SYNC_QUEUE),
  clearSyncQueue: () => AsyncStorage.removeItem(STORAGE_KEYS.SYNC_QUEUE),
};
