import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf } from "telegraf";

@Injectable()
export class SosBotService {
  private bot: Telegraf;
  private readonly logger = new Logger(SosBotService.name);
  private chatId: string;

  constructor(private configService: ConfigService) {
    this.initializeBot();
  }

  private initializeBot() {
    const token = this.configService.get<string>("SOS_BOT_TOKEN");
    this.chatId = this.configService.get<string>("TELEGRAM_CHAT_ID");

    if (token) {
      this.bot = new Telegraf(token);
      this.logger.log("SOS boti obyekti yaratildi.");
    } else {
      this.logger.warn("SOS_BOT_TOKEN topilmadi.");
    }
  }

  async sendSosNotification(data: {
    id: string;
    organizationName: string;
    senderName: string;
    diseaseName: string;
    status: string;
    date: string;
    comment?: string;
    latitude?: number;
    longitude?: number;
  }) {
    if (!this.bot || !this.chatId) return;

    const escapedOrg = this.escapeMarkdown(data.organizationName);
    const escapedDisease = this.escapeMarkdown(data.diseaseName);
    const escapedSender = this.escapeMarkdown(data.senderName);
    const escapedComment = this.escapeMarkdown(data.comment || "Yo'q");

    const message = `
🚨🚨🚨 *SOS XABARNOMASI* 🚨🚨🚨
🔴 *Daraja:* FAVQULODDA
🏢 *Tuman/Shahar:* ${escapedOrg}
👤 *Jo'natuvchi:* ${escapedSender}
🦠 *Kasallik:* ${escapedDisease}
📊 *Holat turi:* ${data.status}
📅 *Sana va vaqt:* ${data.date}
🆔 *SOS ID:* ${data.id}

📝 *Izoh:* ${escapedComment}
${data.latitude && data.longitude ? `📍 *Manzil:* [Google xaritada ko'rish](https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude})` : ""}

⚠️ *DIQQAT:* Ushbu xabar favqulodda epidemiologik vaziyat haqida ogohlantiradi.
    `;

    try {
      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: "Markdown",
      });
      this.logger.log(
        `SOS xabarnomasi (DEDICATED BOT) yuborildi: ${data.diseaseName}`,
      );
    } catch (error) {
      this.logger.error("SOS bot orqali xabar yuborishda xatolik:", error);
    }
  }

  private escapeMarkdown(text: string): string {
    if (!text) return "";
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
  }
}
