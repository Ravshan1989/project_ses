import NetInfo from '@react-native-community/netinfo';
import { offlineStorage } from './offlineStorage';
import axios from 'axios';
import { API_BASE_URL } from '../config';

export class OfflineManager {
  private static isSyncing = false;

  static async init(apiInstance: any) {
    // Listen for connection changes
    NetInfo.addEventListener(state => {
      if (state.isConnected && !this.isSyncing) {
        this.syncQueue(apiInstance);
      }
    });
  }

  static async syncQueue(apiInstance: any) {
    const queue = await offlineStorage.getSyncQueue();
    if (!queue || queue.length === 0) return;

    this.isSyncing = true;
    console.log(`Starting sync of ${queue.length} items...`);

    const remainingQueue = [];

    for (const item of queue) {
      try {
        await apiInstance.request({
          url: item.url,
          method: item.method,
          data: item.data,
        });
        console.log(`Synced item: ${item.url}`);
      } catch (err) {
        console.error(`Sync failed for ${item.url}`, err);
        remainingQueue.push(item);
      }
    }

    await offlineStorage.save('@sync_queue', remainingQueue);
    this.isSyncing = false;
  }

  static async handleRequest(apiInstance: any, config: any) {
    const state = await NetInfo.fetch();
    
    if (!state.isConnected) {
      // If it's a mutation (POST/PUT/PATCH), queue it
      if (['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
        await offlineStorage.addToSyncQueue({
          url: config.url,
          method: config.method,
          data: config.data,
          timestamp: Date.now(),
        });
        return { data: { message: 'Offline: Request queued', offline: true } };
      }
      
      // If it's a GET, try to return cached data if available (this part needs more logic per endpoint)
      return Promise.reject(new Error('No internet connection'));
    }

    return apiInstance(config);
  }
}
