import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf } from "telegraf";
import { DataExportService } from "./data-export.service";
import { Cron } from "@nestjs/schedule";

@Injectable()
export class BackupBotService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(BackupBotService.name);
  private chatId: string;

  constructor(
    private configService: ConfigService,
    private dataExportService: DataExportService,
  ) {
    this.initializeBot();
  }

  private initializeBot() {
    const token =
      this.configService.get<string>("BACKUP_BOT_TOKEN") ||
      process.env.BACKUP_BOT_TOKEN;
    this.chatId =
      this.configService.get<string>("BACKUP_CHAT_ID") ||
      process.env.BACKUP_CHAT_ID;

    if (token) {
      this.bot = new Telegraf(token);
      this.logger.log("Zaxira boti obyekti yaratildi.");
    } else {
      this.logger.warn(
        "BACKUP_BOT_TOKEN topilmadi, Zaxira boti ishga tushmadi. .env faylini yoki environment variablesni tekshiring.",
      );
    }
  }

  onModuleInit() {
    if (!this.bot) {
      this.logger.warn("Bot ishga tushmadi: Token mavjud emas.");
      return;
    }

    if (process.env.SKIP_BOT_LAUNCH === "true") {
      this.logger.warn(
        "SKIP_BOT_LAUNCH=true: Zaxira boti ishga tushirilmadi (409 Conflict oldini olish uchun).",
      );
      return;
    }

    this.setupHandlers();
    this.bot
      .launch()
      .then(() => this.logger.log("Zaxira boti Telegram bilan bog'landi."))
      .catch((err) => {
        this.logger.error(
          "Zaxira botini launch qilishda xatolik:",
          err.message,
        );
      });
  }

  // UZ: Avtomatik zaxira (Har kuni Toshkent vaqti bilan 9:00 va 18:00 da)
  // Cron format: seconds minutes hours dayOfMonth month dayOfWeek
  // ORIGINAL: @Cron("0 0 9,18 * * *")
  @Cron("0 0 9,18 * * *", { timeZone: "Asia/Tashkent" })
  async handleScheduledBackup() {
    this.logger.log("⏳ Avtomatik zaxira (Scheduled) boshlandi...");

    if (!this.bot) {
      this.logger.warn(
        "⚠️ Zaxira boti ishga tushmagan (bot instance null). Qayta urinib ko'rilmoqda...",
      );
      this.initializeBot();
    }

    if (!this.bot || !this.chatId) {
      this.logger.error(
        "❌ Zaxira boti yoki Chat ID mavjud emas. Bekor qilindi.",
      );
      return;
    }

    try {
      const jsonData = await this.dataExportService.exportAllData();
      const buffer = Buffer.from(jsonData, "utf-8");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filename = `auto-backup-${timestamp}.json`;

      await this.bot.telegram.sendDocument(
        this.chatId,
        { source: buffer, filename },
        {
          caption: `💾 *AVTOMATIK ZAXIRA (Toshkent vaqti)*\n📅 Sana: ${new Date().toLocaleString("uz-UZ")}\n\nStatus: Muvaffaqiyatli saqlandi.`,
          parse_mode: "Markdown",
        },
      );
      this.logger.log("✅ Avtomatik zaxira muvaffaqiyatli yuborildi.");
    } catch (error) {
      this.logger.error(`❌ Avtomatik zaxiralashda xatolik: ${error.message}`);
    }
  }

  private setupHandlers() {
    // ... existing handlers ...
    this.bot.command("backup", async (ctx) => {
      this.logger.log(`Zaxira buyrug'i olindi (Manual): ${ctx.from.username}`);
      await ctx.reply("⏳ Zaxira yaratish boshlandi, iltimos kuting...");

      try {
        const jsonData = await this.dataExportService.exportAllData();
        const buffer = Buffer.from(jsonData, "utf-8");
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const filename = `backup-${timestamp}.json`;

        await ctx.replyWithDocument(
          { source: buffer, filename },
          {
            caption: `✅ Baza zaxirasi muvaffaqiyatli yaratildi.\n📅 Sana: ${new Date().toLocaleString("uz-UZ")}`,
          },
        );
        this.logger.log("✅ Manual zaxira yuborildi.");
      } catch (error) {
        this.logger.error(`❌ Manual zaxirada xatolik: ${error.message}`);
        await ctx.reply(`❌ Xatolik yuz berdi: ${error.message}`);
      }
    });

    this.bot.start((ctx) => {
      ctx.reply(
        "Assalomu alaykum! Men ma'lumotlarni zaxiralash botiman. /backup buyrug'i orqali bazangizni saqlab qo'yishingiz mumkin.",
      );
    });

    this.bot.help((ctx) =>
      ctx.reply(
        "Ma'lumotlarni zaxira qilish uchun /backup buyrug'idan foydalaning.",
      ),
    );
  }
}
