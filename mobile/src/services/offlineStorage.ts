import AsyncStorage from '@react-native-async-storage/async-storage';

const OFFLINE_REPORTS_KEY = 'offline_reports_queue';

export interface OfflineReport {
    id: string;
    type: 'ari' | 'covid' | 'general';
    data: any;
    timestamp: number;
}

export const offlineStorage = {
    // UZ: Hisobotni lokal saqlash
    saveReport: async (type: string, data: any) => {
        try {
            const existing = await AsyncStorage.getItem(OFFLINE_REPORTS_KEY);
            const queue: OfflineReport[] = existing ? JSON.parse(existing) : [];

            const newReport: OfflineReport = {
                id: Math.random().toString(36).substr(2, 9),
                type: type as any,
                data,
                timestamp: Date.now(),
            };

            queue.push(newReport);
            await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(queue));
            return true;
        } catch (error) {
            console.error('Offline storage error:', error);
            return false;
        }
    },

    // UZ: Navbatdagi hisobotlarni olish
    getQueue: async (): Promise<OfflineReport[]> => {
        try {
            const existing = await AsyncStorage.getItem(OFFLINE_REPORTS_KEY);
            return existing ? JSON.parse(existing) : [];
        } catch (error) {
            return [];
        }
    },

    // UZ: Muayyan hisobotni o'chirish
    removeReport: async (id: string) => {
        try {
            const existing = await AsyncStorage.getItem(OFFLINE_REPORTS_KEY);
            if (!existing) return;
            const queue: OfflineReport[] = JSON.parse(existing);
            const filtered = queue.filter(r => r.id !== id);
            await AsyncStorage.setItem(OFFLINE_REPORTS_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Remove offline report error:', error);
        }
    },

    // UZ: Navbat hajmini olish
    getQueueSize: async () => {
        const queue = await offlineStorage.getQueue();
        return queue.length;
    }
};
