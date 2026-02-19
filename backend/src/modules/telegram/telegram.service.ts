import {
  Injectable,
  Logger,
  OnModuleInit,
  Inject,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf, Markup } from "telegraf";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { DailyReportsService } from "../daily-reports/daily-reports.service";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
  private chatId: string;
  private adminChatId: string;
  private systemUser: User;

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => DailyReportsService))
    private dailyReportsService: DailyReportsService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {
    const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");
    this.chatId = this.configService.get<string>("TELEGRAM_CHAT_ID");
    this.adminChatId = this.configService.get<string>("TELEGRAM_ADMIN_CHAT_ID");

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

    if (process.env.SKIP_BOT_LAUNCH === "true") {
      this.logger.warn(
        "SKIP_BOT_LAUNCH=true: Telegram bot ishga tushirilmadi (409 Conflict oldini olish uchun).",
      );
      return;
    }

    this.setupHandlers();
    this.bot.launch().catch((err) => {
      this.logger.error("Telegram bot ishga tushirishda xatolik:", err);
    });
    this.logger.log("Telegram bot interactive rejimda ishga tushdi.");
  }

  private setupHandlers() {
    this.bot.use((ctx, next) => {
      this.logger.debug(
        `Telegram update received: ${JSON.stringify(ctx.update)}`,
      );
      return next();
    });

    this.bot.start(async (ctx) => {
      this.logger.log(`Bot /start buyrug'ini oldi: ${ctx.from.username}`);

      // Check if user came from registration (has start parameter with user ID)
      const startPayload = ctx.startPayload;
      if (startPayload) {
        try {
          const userId = startPayload;
          const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['organization']
          });

          if (user) {
            // Request phone number for verification
            await ctx.reply(
              `Assalomu alaykum!\n\n` +
              `Davom etish uchun telefon raqamingizni tasdiqlang.\n\n` +
              `Quyidagi tugmani bosing:`,
              Markup.keyboard([
                Markup.button.contactRequest('📞 Telefon raqamni yuborish')
              ]).resize()
            );

            this.logger.log(`Requested phone verification for user ${userId}`);
            return;
          }
        } catch (error) {
          this.logger.error('Error processing /start with payload:', error);
        }
      }

      // Default /start response for report requests
      return ctx.reply(
        "Assalomu alaykum! Kerakli hisobot turini tanlang:",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🟡 Gepatit", "get_hep"),
            Markup.button.callback("🔴 Covid", "get_covid"),
          ],
          [
            Markup.button.callback("🔵 Gripp (Batafsil)", "get_flu"),
            Markup.button.callback("🟢 O'RVI", "get_ari"),
          ],
          [Markup.button.callback("🟣 Epidemiologiya", "get_epi")],
        ]),
      );
    });

    // Handle phone number verification
    this.bot.on('contact', async (ctx) => {
      const contact = ctx.message.contact;
      const phoneNumber = contact.phone_number;

      this.logger.log(`Received phone number: ${phoneNumber} from ${ctx.from.id}`);

      try {
        // Find user by phone number
        const user = await this.userRepository.findOne({
          where: { phoneNumber: phoneNumber.replace(/\D/g, '') },
          relations: ['organization']
        });

        if (user) {
          // Save Telegram chat ID
          user.telegramChatId = ctx.from.id.toString();
          await this.userRepository.save(user);

          await ctx.reply(
            `✅ Tasdiqlandi!\n\n` +
            `Assalomu alaykum, ${user.firstName}!\n\n` +
            `Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n` +
            `Ma'lumotlaringiz tekshirilmoqda.\n\n` +
            `${user.organization?.name || 'Tashkilot'} kadri tasdiqlashidan so'ng ` +
            `login va parol shu yerga yuboriladi.`,
            Markup.removeKeyboard()
          );
          this.logger.log(`Phone verified and chat ID saved for user ${user.id}`);
        } else {
          await ctx.reply(
            `❌ Xatolik!\n\n` +
            `Bu telefon raqam tizimda topilmadi.\n\n` +
            `Iltimos, ro'yxatdan o'tishda kiritgan telefon raqamingizni yuboring.`,
            Markup.removeKeyboard()
          );
          this.logger.warn(`Phone number ${phoneNumber} not found in database`);
        }
      } catch (error) {
        this.logger.error('Error verifying phone number:', error);
        await ctx.reply(
          `❌ Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.`,
          Markup.removeKeyboard()
        );
      }
    });

    this.bot.action("get_hep", (ctx) => {
      this.logger.log("Gepatit hisoboti so'raldi");
      return this.handleReportRequest(ctx, "hep");
    });
    this.bot.action("get_covid", (ctx) => {
      this.logger.log("Covid hisoboti so'raldi");
      return this.handleReportRequest(ctx, "covid");
    });
    this.bot.action("get_flu", (ctx) => {
      this.logger.log("Gripp hisoboti so'raldi");
      return this.handleReportRequest(ctx, "flu");
    });
    this.bot.action("get_ari", (ctx) => {
      this.logger.log("O'RVI hisoboti so'raldi");
      return this.handleReportRequest(ctx, "ari");
    });
    this.bot.action("get_epi", (ctx) => {
      this.logger.log("Epidemiologiya hisoboti so'raldi");
      return this.handleReportRequest(ctx, "epi");
    });

    // Registration approval handlers
    this.bot.action(/^approve_/, (ctx) => {
      const userId = ctx.match[0].replace("approve_", "");
      this.logger.log(`User approval requested: ${userId}`);
      return this.handleApproval(ctx, userId);
    });

    this.bot.action(/^reject_/, (ctx) => {
      const userId = ctx.match[0].replace("reject_", "");
      this.logger.log(`User rejection requested: ${userId}`);
      return this.handleRejection(ctx, userId);
    });
  }

  private async handleReportRequest(ctx: any, type: string) {
    // UZ: Toshkent vaqti bilan bugungi sanani olish (UTC+5)
    const now = new Date();
    const tashkentOffset = 5 * 60 * 60 * 1000;
    const today = new Date(now.getTime() + tashkentOffset)
      .toISOString()
      .split("T")[0];

    let message = `📅 *${today}* holatiga ko'ra tumanlar statistikasi:\n\n`;

    try {
      if (type === "hep") {
        const data = await this.dailyReportsService.getByDate(
          today,
          this.systemUser,
        );
        if (data.length === 0) message += "Ma'lumot topilmadi.";
        data.forEach((r) => {
          const orgName = this.escapeMarkdown(r.organization?.name || "");
          message += `🏢 *${orgName}:* Jami: ${r.total_cases}, Musbat: ${r.lab_positive}\n`;
        });
      } else if (type === "covid") {
        const data = await this.dailyReportsService.getCovidByDate(
          today,
          this.systemUser,
        );
        if (data.length === 0) message += "Ma'lumot topilmadi.";
        data.forEach((r) => {
          const orgName = this.escapeMarkdown(r.organization?.name || "");
          message += `🏢 *${orgName}:* Jami: ${r.total_cases}, Hospital: ${r.hospitalized_count}\n`;
        });
      } else if (type === "flu") {
        const data = await this.dailyReportsService.getFluByDate(
          today,
          this.systemUser,
        );
        if (data.length === 0) message += "Ma'lumot topilmadi.";
        data.forEach((r) => {
          const orgName = this.escapeMarkdown(r.organization?.name || "");
          message += `🏢 *${orgName}:* O'RVI: ${r.ari_total}, Gripp: ${r.flu_total}\n`;
        });
      } else if (type === "ari") {
        const data = await this.dailyReportsService.getAriByDate(
          today,
          this.systemUser,
        );
        if (data.length === 0) message += "Ma'lumot topilmadi.";
        data.forEach((r) => {
          const orgName = this.escapeMarkdown(r.organization?.name || "");
          message += `🏢 *${orgName}:* O'RVI: ${r.ari}\n`;
        });
      } else if (type === "epi") {
        const data = await this.dailyReportsService.getEpidemiologyByDate(
          today,
          this.systemUser,
        );
        if (data.length === 0) message += "Ma'lumot topilmadi.";
        data.forEach((r) => {
          const orgName = this.escapeMarkdown(r.organization?.name || "");
          message += `🏢 *${orgName}:* Tekshirildi: ${r.inspected_total}, Jarima: ${r.fines_total}\n`;
        });
      }

      await ctx.editMessageText(message, { parse_mode: "Markdown" });
      // Restore keyboard
      await ctx.reply(
        "Yana biror ma'lumot kerakmi?",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🟡 Gepatit", "get_hep"),
            Markup.button.callback("🔴 Covid", "get_covid"),
          ],
          [
            Markup.button.callback("🔵 Gripp (Batafsil)", "get_flu"),
            Markup.button.callback("🟢 O'RVI", "get_ari"),
          ],
          [Markup.button.callback("🟣 Epidemiologiya", "get_epi")],
        ]),
      );
    } catch (error) {
      this.logger.error("Ma'lumot olishda xatolik:", error);
      await ctx.reply("Kechirasiz, ma'lumotlarni olishda xatolik yuz berdi.");
    }
  }

  async sendReportNotification(
    type: string,
    organizationName: string,
    date: string,
    details: string,
  ) {
    if (!this.bot || !this.chatId) {
      return;
    }

    const escapedOrg = this.escapeMarkdown(organizationName);
    const escapedType = this.escapeMarkdown(type);
    const escapedDetails = this.escapeMarkdown(details);
    try {
      const message = `
🔔 *Yangi kunlik hisobot*
🏷 *Turi:* ${escapedType}
🏢 *Tashkilot:* ${escapedOrg}
📅 *Sana:* ${date}

📊 *Ma'lumotlar:*
${escapedDetails}
    `;

      await this.bot.telegram.sendMessage(this.chatId, message, {
        parse_mode: "Markdown",
      });
      this.logger.log(
        `Telegram xabarnomasi yuborildi: ${type} - ${organizationName}`,
      );
    } catch (error) {
      this.logger.error("Telegram xabarnomasini yuborishda xatolik:", error);
    }
  }

  async sendSosNotification(data: {
    id: string;
    organizationName: string;
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
    const escapedComment = this.escapeMarkdown(data.comment || "Yo'q");
    const message = `
🚨🚨🚨 *SOS XABARNOMASI* 🚨🚨🚨
🔴 *Daraja:* FAVQULODDA
🏢 *Tuman/Shahar:* ${escapedOrg}
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
        `SOS Telegram xabarnomasi yuborildi: ${data.diseaseName} - ${data.organizationName}`,
      );
    } catch (error) {
      this.logger.error(
        "SOS Telegram xabarnomasini yuborishda xatolik:",
        error,
      );
    }
  }

  // Registration notification and approval methods
  async sendRegistrationNotification(user: User): Promise<void> {
    if (!this.bot) {
      this.logger.warn("Bot not initialized");
      return;
    }

    const fullName = `${user.lastName || ""} ${user.firstName || ""} ${user.middleName || ""}`.trim();
    const message = `
🆕 <b>Yangi foydalanuvchi ro'yxatdan o'tdi!</b>

👤 <b>F.I.O:</b> ${fullName}
📞 <b>Telefon:</b> ${user.phoneNumber || "Ko'rsatilmagan"}
🏢 <b>Tashkilot:</b> ${user.organization?.name || "Ko'rsatilmagan"}
📋 <b>Bo'lim:</b> ${user.department?.name || "Ko'rsatilmagan"}
💼 <b>Lavozim:</b> ${this.getRoleLabel(user.role)}

<i>Ushbu foydalanuvchini tasdiqlaysizmi?</i>
    `.trim();

    const keyboard = {
      inline_keyboard: [
        [
          { text: "✅ Tasdiqlash", callback_data: `approve_${user.id}` },
          { text: "❌ Rad etish", callback_data: `reject_${user.id}` },
        ],
      ],
    };

    try {
      // Find HR users in the same organization
      const hrUsers = await this.userRepository.find({
        where: {
          role: UserRole.HR,
          organization: { id: user.organization?.id },
          isActive: true,
        },
      });

      let sentCount = 0;

      // Send to all HR users with Telegram chat ID
      for (const hrUser of hrUsers) {
        if (hrUser.telegramChatId) {
          try {
            await this.bot.telegram.sendMessage(hrUser.telegramChatId, message, {
              parse_mode: "HTML",
              reply_markup: keyboard,
            });
            sentCount++;
            this.logger.log(`Notification sent to HR user ${hrUser.username} (${hrUser.telegramChatId})`);
          } catch (error) {
            this.logger.error(`Failed to send to HR user ${hrUser.username}:`, error);
          }
        }
      }

      // Fallback to admin if no HR users found or none have Telegram
      if (sentCount === 0 && this.adminChatId) {
        await this.bot.telegram.sendMessage(this.adminChatId, message, {
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
        this.logger.log(`No HR users found, sent to admin instead for user ${user.id}`);
      } else {
        this.logger.log(`Registration notification sent to ${sentCount} HR user(s) for user ${user.id}`);
      }
    } catch (error) {
      this.logger.error("Failed to send registration notification", error);
    }
  }

  private async handleApproval(ctx: any, userId: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ["organization", "department"],
      });

      if (!user) {
        await ctx.editMessageText("❌ Foydalanuvchi topilmadi");
        return;
      }

      // Generate username and password
      const username = this.generateUsername(user);
      const password = this.generatePassword();
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Update user
      user.username = username;
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.approvedAt = new Date();

      await this.userRepository.save(user);

      // Update admin message
      const approvalMessage = `
✅ <b>Tasdiqlandi!</b>

👤 <b>Foydalanuvchi:</b> ${user.lastName} ${user.firstName}
🔐 <b>Login:</b> <code>${username}</code>
🔑 <b>Parol:</b> <code>${password}</code>

<i>Foydalanuvchiga ma'lumotlar yuborildi.</i>
      `.trim();

      await ctx.editMessageText(approvalMessage, { parse_mode: "HTML" });

      this.logger.log(
        `User approved: ${username} / ${password} (User ID: ${userId})`,
      );
    } catch (error) {
      this.logger.error("Failed to approve user", error);
      await ctx.editMessageText("❌ Xatolik yuz berdi");
    }
  }

  private async handleRejection(ctx: any, userId: string) {
    try {
      const user = await this.userRepository.findOne({ where: { id: userId } });

      if (!user) {
        await ctx.editMessageText("❌ Foydalanuvchi topilmadi");
        return;
      }

      // Delete user from database
      await this.userRepository.remove(user);

      const rejectionMessage = `
❌ <b>Rad etildi</b>

👤 <b>Foydalanuvchi:</b> ${user.lastName} ${user.firstName}

<i>Foydalanuvchi ma'lumotlar bazasidan o'chirildi.</i>
      `.trim();

      await ctx.editMessageText(rejectionMessage, { parse_mode: "HTML" });

      this.logger.log(`User rejected and deleted: ${userId}`);
    } catch (error) {
      this.logger.error("Failed to reject user", error);
    }
  }

  private generateUsername(user: User): string {
    const firstName = user.firstName?.toLowerCase().replace(/\s+/g, "") || "";
    const lastName = user.lastName?.toLowerCase().replace(/\s+/g, "") || "";

    if (firstName && lastName) {
      return `${firstName}.${lastName}`;
    } else {
      return `user_${Date.now()}`;
    }
  }

  private generatePassword(): string {
    const chars =
      "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let password = "";
    for (let i = 0; i < 10; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private getRoleLabel(role: string): string {
    const roleLabels = {
      STAFF: "Xodim",
      DISTRICT_SPECIALIST: "Tuman mutaxassisi",
      DEPARTMENT_HEAD: "Bo'lim mudiri",
      REGION_HEAD: "Viloyat mudiri",
      REPUBLIC_HEAD: "Respublika mudiri",
      LAB_HEAD: "Laboratoriya mudiri",
      DISTRICT_HEAD: "Tuman boshlig'i",
      DISTRICT_OPERATOR: "Tuman operatori",
      ADMIN: "Administrator",
    };
    return roleLabels[role] || role;
  }

  async sendActivationNotification(user: User, password: string): Promise<void> {
    if (!this.bot) return;

    const message = `
✅ <b>Tabriklaymiz! Sizning akkauntingiz faollashtirildi.</b>

Tizimga kirish uchun ma'lumotlar:
👤 <b>Login:</b> <code>${user.username}</code>
🔑 <b>Parol:</b> <code>${password}</code>

<i>Iltimos, parolni hech kimga bermang.</i>
    `.trim();

    try {
      // 1. Try sending to the user if they have a chat ID
      if (user.telegramChatId) {
        await this.bot.telegram.sendMessage(user.telegramChatId, message, { parse_mode: 'HTML' });
        this.logger.log(`Activation notification sent to user ${user.username} (${user.telegramChatId})`);
        return;
      }

      // 2. If user has no chat ID, send to Admin (fallback)
      if (this.adminChatId) {
        const adminMessage = `
⚠️ <b>Foydalanuvchi faollashtirildi, lekin Telegram ID topilmadi.</b>
Login/Parol Adminga yuborilmoqda:

👤 <b>Foydalanuvchi:</b> ${user.lastName} ${user.firstName}
👤 <b>Login:</b> <code>${user.username}</code>
🔑 <b>Parol:</b> <code>${password}</code>
        `.trim();

        await this.bot.telegram.sendMessage(this.adminChatId, adminMessage, { parse_mode: 'HTML' });
        this.logger.log(`Activation notification sent to ADMIN for user ${user.username}`);
      } else {
        this.logger.warn(`Could not send activation notification for ${user.username}: No Chat ID and No Admin ID.`);
      }

    } catch (error) {
      this.logger.error(`Failed to send activation notification for ${user.username}`, error);
    }
  }

  private escapeMarkdown(text: string): string {
    if (!text) return "";
    return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, "\\$&");
  }
}
