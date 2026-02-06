import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf } from 'telegraf';
import { DataExportService } from './data-export.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BackupBotService implements OnModuleInit {
    private bot: Telegraf;
    private readonly logger = new Logger(BackupBotService.name);
    private chatId: string;

    constructor(
        private configService: ConfigService,
        private dataExportService: DataExportService,
    ) {
        const token = this.configService.get<string>('BACKUP_BOT_TOKEN');
        this.chatId = this.configService.get<string>('BACKUP_CHAT_ID');

        if (token) {
            this.bot = new Telegraf(token);
        } else {
            this.logger.warn('BACKUP_BOT_TOKEN topilmadi, Zaxira boti ishga tushmadi.');
        }
    }

    onModuleInit() {
        if (!this.bot) return;

        this.setupHandlers();
        this.bot.launch().catch((err) => {
            this.logger.error('Zaxira boti ishga tushirishda xatolik:', err);
        });
        this.logger.log('Zaxira boti ishga tushdi.');
    }

    // UZ: Avtomatik zaxira (Har kuni 9:00 va 18:00 da)
    @Cron('0 0 9,18 * * *')
    async handleScheduledBackup() {
        this.logger.log('Avtomatik zaxira yaratish boshlandi...');
        if (!this.bot || !this.chatId) return;

        try {
            const jsonData = await this.dataExportService.exportAllData();
            const buffer = Buffer.from(jsonData, 'utf-8');
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `auto-backup-${timestamp}.json`;

            await this.bot.telegram.sendDocument(
                this.chatId,
                { source: buffer, filename },
                { caption: `💾 *AVTOMATIK ZAXIRA*\n📅 Sana: ${new Date().toLocaleString('uz-UZ')}\n\nKeyingi zaxira soat 09:00 yoki 18:00 da amalga oshiriladi.`, parse_mode: 'Markdown' }
            );
            this.logger.log('Avtomatik zaxira muvaffaqiyatli yuborildi.');
        } catch (error) {
            this.logger.error('Avtomatik zaxiralashda xatolik:', error);
        }
    }

    private setupHandlers() {
        this.bot.command('backup', async (ctx) => {
            this.logger.log(`Zaxira buyrug'i olindi: ${ctx.from.username}`);
            await ctx.reply('Zaxira yaratish boshlandi, iltimos kuting...');

            try {
                const jsonData = await this.dataExportService.exportAllData();
                const buffer = Buffer.from(jsonData, 'utf-8');
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
                const filename = `backup-${timestamp}.json`;

                await ctx.replyWithDocument(
                    { source: buffer, filename },
                    { caption: `✅ Baza zaxirasi muvaffaqiyatli yaratildi.\n📅 Sana: ${new Date().toLocaleString('uz-UZ')}` }
                );
            } catch (error) {
                this.logger.error('Zaxira yaratishda xatolik:', error);
                await ctx.reply(`❌ Xatolik yuz berdi: ${error.message}`);
            }
        });

        this.bot.start((ctx) => {
            ctx.reply('Assalomu alaykum! Men ma\'lumotlarni zaxiralash botiman. /backup buyrug\'i orqali bazangizni saqlab qo\'yishingiz mumkin.');
        });
    }
}
