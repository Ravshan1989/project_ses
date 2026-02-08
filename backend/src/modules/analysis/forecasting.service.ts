import { Injectable } from "@nestjs/common";

@Injectable()
export class ForecastingService {
  /**
   * UZ: Trendni bashorat qilish (Simple Moving Average)
   * @param data Tarixiy ma'lumotlar massivi (sonlar)
   * @returns Bashorat qilingan keyingi qiymat
   */
  predictNext(data: number[]): number {
    if (!data || data.length === 0) return 0;
    if (data.length === 1) return data[0];

    // UZ: Oxirgi 3 ta qiymat bo'yicha o'rtacha o'sishni hisoblaymiz
    const windowSize = Math.min(data.length, 3);
    const recentData = data.slice(-windowSize);

    const sum = recentData.reduce((a, b) => a + b, 0);
    const average = sum / windowSize;

    // UZ: O'sish koeffitsientini aniqlash (oddiy trend)
    const first = recentData[0];
    const last = recentData[recentData.length - 1];
    const trend = last >= first ? 1.1 : 0.9; // 10% o'sish yoki kamayish

    return Math.round(average * trend);
  }

  /**
   * UZ: Murakkabroq bashorat (Linear Regression asosi)
   */
  predictAdvanced(data: { x: number; y: number }[]): number {
    // UZ: Kelajakda murakkab algoritmlar (ML) qo'shish uchun joy
    return 0;
  }
}
