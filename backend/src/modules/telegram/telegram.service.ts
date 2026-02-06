import { Injectable, Logger, OnModuleInit, Inject, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';
import { DailyReportsService } from '../daily-reports/daily-reports.service';
import { User } from '../users/entities/user.entity';
import { UserRole } from '../../common/enums/role.enum';

@Injectable()
export class TelegramService implements OnModuleInit {
    private bot: Telegraf;
    private readonly logger = new Logger(TelegramService.name);
    private chatId: string;
    private systemUser: User;

    constructor(
        private configService: ConfigService,
        @Inject(forwardRef(() => DailyReportsService))
        private dailyReportsService: DailyReportsService,
    ) {
        const token = this.configService.get<string>('TELEGRAM_BOT_TOKEN');
        this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID');

        if (token) {
            this.bot = new Telegraf(token);
        }

        // Mock admin user for data fetching
        this.systemUser = {
            role: UserRole.ADMIN,
            organization: null,
        } as User;
    }

    onModuleInit() {
        if (!this.bot) return;

        this.setupHandlers();
        this.bot.launch().catch((err) => {
            this.logger.error('Telegram bot ishga tushirishda xatolik:', err);
        });
        this.logger.log('Telegram bot interactive rejimda ishga tushdi.');
    }

    private setupHandlers() {
        this.bot.use((ctx, next) => {
            this.logger.debug(`Telegram update received: ${JSON.stringify(ctx.update)}`);
            return next();
        });

        this.bot.start((ctx) => {
            this.logger.log(`Bot /start buyrug'ini oldi: ${ctx.from.username}`);
            return ctx.reply(
                'Assalomu alaykum! Kerakli hisobot turini tanlang:',
                Markup.inlineKeyboard([
                    [Markup.button.callback('🟡 Gepatit', 'get_hep'), Markup.button.callback('🔴 Covid', 'get_covid')],
                    [Markup.button.callback('🔵 Gripp (Batafsil)', 'get_flu'), Markup.button.callback('🟢 O\'RVI', 'get_ari')],
                    [Markup.button.callback('🟣 Epidemiologiya', 'get_epi')],
                ]),
            );
        });

        this.bot.action('get_hep', (ctx) => {
            this.logger.log('Gepatit hisoboti so\'raldi');
            return this.handleReportRequest(ctx, 'hep');
        });
        this.bot.action('get_covid', (ctx) => {
            this.logger.log('Covid hisoboti so\'raldi');
            return this.handleReportRequest(ctx, 'covid');
        });
        this.bot.action('get_flu', (ctx) => {
            this.logger.log('Gripp hisoboti so\'raldi');
            return this.handleReportRequest(ctx, 'flu');
        });
        this.bot.action('get_ari', (ctx) => {
            this.logger.log('O\'RVI hisoboti so\'raldi');
            return this.handleReportRequest(ctx, 'ari');
        });
        this.bot.action('get_epi', (ctx) => {
            this.logger.log('Epidemiologiya hisoboti so\'raldi');
            return this.handleReportRequest(ctx, 'epi');
        });
    }

    private async handleReportRequest(ctx: any, type: string) {
        const today = new Date().toISOString().split('T')[0];
        let message = `📅 *${today}* holatiga ko'ra tumanlar statistikasi:\n\n`;

        try {
            if (type === 'hep') {
                const data = await this.dailyReportsService.getByDate(today, this.systemUser);
                if (data.length === 0) message += "Ma'lumot topilmadi.";
                data.forEach(r => {
                    message += `🏢 *${r.organization?.name}:* Jami: ${r.total_cases}, Musbat: ${r.lab_positive}\n`;
                });
            } else if (type === 'covid') {
                const data = await this.dailyReportsService.getCovidByDate(today, this.systemUser);
                if (data.length === 0) message += "Ma'lumot topilmadi.";
                data.forEach(r => {
                    message += `🏢 *${r.organization?.name}:* Jami: ${r.total_cases}, Hospital: ${r.hospitalized_count}\n`;
                });
            } else if (type === 'flu') {
                const data = await this.dailyReportsService.getFluByDate(today, this.systemUser);
                if (data.length === 0) message += "Ma'lumot topilmadi.";
                data.forEach(r => {
                    message += `🏢 *${r.organization?.name}:* O'RVI: ${r.ari_total}, Gripp: ${r.flu_total}\n`;
                });
            } else if (type === 'ari') {
                const data = await this.dailyReportsService.getAriByDate(today, this.systemUser);
                if (data.length === 0) message += "Ma'lumot topilmadi.";
                data.forEach(r => {
                    message += `🏢 *${r.organization?.name}:* O'RVI: ${r.ari}\n`;
                });
            } else if (type === 'epi') {
                const data = await this.dailyReportsService.getEpidemiologyByDate(today, this.systemUser);
                if (data.length === 0) message += "Ma'lumot topilmadi.";
                data.forEach(r => {
                    message += `🏢 *${r.organization?.name}:* Tekshirildi: ${r.inspected_total}, Jarima: ${r.fines_total}\n`;
                });
            }

            await ctx.editMessageText(message, { parse_mode: 'Markdown' });
            // Restore keyboard
            await ctx.reply('Yana biror ma\'lumot kerakmi?', Markup.inlineKeyboard([
                [Markup.button.callback('🟡 Gepatit', 'get_hep'), Markup.button.callback('🔴 Covid', 'get_covid')],
                [Markup.button.callback('🔵 Gripp (Batafsil)', 'get_flu'), Markup.button.callback('🟢 O\'RVI', 'get_ari')],
                [Markup.button.callback('🟣 Epidemiologiya', 'get_epi')],
            ]));
        } catch (error) {
            this.logger.error('Ma\'lumot olishda xatolik:', error);
            await ctx.reply('Kechirasiz, ma\'lumotlarni olishda xatolik yuz berdi.');
        }
    }

    async sendReportNotification(type: string, organizationName: string, date: string, details: string) {
        if (!this.bot || !this.chatId) {
            return;
        }

        const message = `
🔔 *Yangi kunlik hisobot*
🏷 *Turi:* ${type}
🏢 *Tashkilot:* ${organizationName}
📅 *Sana:* ${date}

📊 *Ma'lumotlar:*
${details}
    `;

        try {
            await this.bot.telegram.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
            this.logger.log(`Telegram xabarnomasi yuborildi: ${type} - ${organizationName}`);
        } catch (error) {
            this.logger.error('Telegram xabarnomasini yuborishda xatolik:', error);
        }
    }

    async sendSosNotification(data: {
        id: string;
        organizationName: string;
        diseaseName: string;
        status: string;
        date: string;
        comment?: string;
    }) {
        if (!this.bot || !this.chatId) return;

        const message = `
🚨🚨🚨 *SOS XABARNOMASI* 🚨🚨🚨
🔴 *Daraja:* FAVQULODDA
🏢 *Tuman/Shahar:* ${data.organizationName}
🦠 *Kasallik:* ${data.diseaseName}
📊 *Holat turi:* ${data.status}
📅 *Sana va vaqt:* ${data.date}
🆔 *SOS ID:* ${data.id}

📝 *Izoh:* ${data.comment || 'Yo\'q'}

⚠️ *DIQQAT:* Ushbu xabar favqulodda epidemiologik vaziyat haqida ogohlantiradi.
    `;

        try {
            await this.bot.telegram.sendMessage(this.chatId, message, { parse_mode: 'Markdown' });
            this.logger.log(`SOS Telegram xabarnomasi yuborildi: ${data.diseaseName} - ${data.organizationName}`);
        } catch (error) {
            this.logger.error('SOS Telegram xabarnomasini yuborishda xatolik:', error);
        }
    }
}
