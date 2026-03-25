import {
  Inject,
  Injectable,
  Logger,
  OnModuleInit,
  forwardRef,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Telegraf, Markup } from "telegraf";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { User } from "../users/entities/user.entity";
import { UserRole } from "../../common/enums/role.enum";
import { UsersService } from "../users/users.service";
import { Organization } from "../organizations/entities/organization.entity";

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
  private chatId: string;
  private adminChatId: string;
  private userStates: Map<
    number,
    {
      step: string;
      data: any;
      timeout?: NodeJS.Timeout;
    }
  > = new Map();

  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Organization)
    private organizationRepository: Repository<Organization>,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
  ) {
    const token = this.configService.get<string>("TELEGRAM_BOT_TOKEN");
    this.chatId = this.configService.get<string>("TELEGRAM_CHAT_ID");
    this.adminChatId = this.configService.get<string>("TELEGRAM_ADMIN_CHAT_ID");

    if (token) {
      this.bot = new Telegraf(token);
    }
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

    // UZ: Faqat ro'yxatga olish uchun buyruqlar
    this.bot.telegram
      .setMyCommands([
        { command: "start", description: "Botni ishga tushirish" },
        { command: "organizations", description: "Tashkilotlar ro'yxati" },
        { command: "help", description: "Yordam" },
      ])
      .catch((err) => {
        this.logger.error("Failed to set Telegram commands:", err);
      });

    this.bot.telegram
      .deleteWebhook()
      .then(() => {
        this.bot
          .launch()
          .then(() => {
            this.logger.log(
              "Ro'yxatga olish boti polling rejimda ishga tushdi.",
            );
          })
          .catch((err) => {
            this.logger.error("Bot ishga tushirishda xatolik:", err);
          });
      })
      .catch((err) => {
        this.logger.error("Webhookni o'chirishda xatolik:", err);
      });
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

      return ctx.reply(
        `Assalomu alaykum! Tizimdan foydalanish uchun telefon raqamingizni tasdiqlang.`,
        Markup.keyboard([
          [Markup.button.contactRequest("📞 Telefon raqamni yuborish")],
        ]).resize(),
      );
    });

    this.bot.command("organizations", async (ctx) => {
      this.logger.log(
        `Bot /organizations buyrug'ini oldi: ${ctx.from.username}`,
      );
      try {
        const organizations = await this.organizationRepository.find();
        if (organizations.length === 0) {
          return ctx.reply("Tashkilotlar topilmadi.");
        }

        const orgList = organizations
          .map((org, index) => `${index + 1}. ${org.name}`)
          .join("\n");

        return ctx.reply(`🏢 <b>Tashkilotlar ro'yxati:</b>\n\n${orgList}`, {
          parse_mode: "HTML",
        });
      } catch (error) {
        this.logger.error("Error fetching organizations for bot:", error);
        return ctx.reply("❌ Ma'lumotlarni yuklashda xatolik yuz berdi.");
      }
    });

    this.bot.command("stats", async (ctx) => {
      this.logger.log(`Bot /stats buyrug'ini oldi: ${ctx.from.username}`);
      try {
        const orgCount = await this.organizationRepository.count();
        const userCount = await this.userRepository.count({
          where: { isActive: true },
        });

        const message = `
📊 <b>Tizim statistikasi:</b>
  
🏢 <b>Tashkilotlar:</b> ${orgCount}
👥 <b>Faol foydalanuvchilar:</b> ${userCount}
🕒 <b>Vaqt:</b> ${new Date().toLocaleString("uz-UZ")}

<i>Batafsil ma'lumot uchun Dashboardga kiring.</i>
        `.trim();

        return ctx.reply(message, { parse_mode: "HTML" });
      } catch (error) {
        this.logger.error("Error in /stats command:", error);
        return ctx.reply("❌ Statistikani yuklashda xatolik yuz berdi.");
      }
    });

    // Handle phone number verification
    this.bot.on("contact", async (ctx) => {
      try {
        const contact = ctx.message.contact;
        const rawPhone = contact.phone_number;
        const tgId = ctx.from.id.toString();

        this.logger.log(
          `[BOT DEBUG] Received contact: ${rawPhone} from TG ID: ${tgId}`,
        );
        await ctx.reply(`⏳ Qidirilmoqda: ${rawPhone}...`).catch(() => {});

        const digitsOnly = rawPhone.replace(/\D/g, "");
        const withPlus = `+${digitsOnly}`;

        // UZ: Raqamni barcha formatlarda (probel bilan yoki probelsiz) qidirish uchun normallashtiramiz
        const user = await this.userRepository
          .createQueryBuilder("user")
          .where(
            "REPLACE(REPLACE(\"phoneNumber\", ' ', ''), '+', '') = :phone",
            { phone: digitsOnly },
          )
          .getOne();

        if (user) {
          this.logger.log(
            `[BOT DEBUG] User found: ${user.username} for phone: ${rawPhone}`,
          );
          user.telegramChatId = tgId;
          user.phoneNumber = withPlus;
          await this.userRepository.save(user);

          let approvalMessage = "";
          if (!user.isActive) {
            await this.sendRegistrationNotification(user);
            approvalMessage = `Ma'lumotlaringiz tekshirilmoqda.\n\n${user.organization?.name || "Tashkilot"} kadri tasdiqlashidan so'ng login va parol yuboriladi.`;
          } else {
            approvalMessage = `Siz avvalroq tasdiqlangansiz! Tizimga kirishingiz mumkin.`;
          }

          await ctx.reply(
            `✅ Tasdiqlandi!\n\n` +
              `Assalomu alaykum, ${user.firstName}!\n\n` +
              `Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n` +
              approvalMessage,
            Markup.removeKeyboard(),
          );
        } else {
          this.logger.warn(
            `[BOT DEBUG] User NOT found for phone: ${rawPhone} (digitsOnly: ${digitsOnly})`,
          );
          await ctx.reply(
            `❌ Xatolik! Bu telefon raqam (${rawPhone}) tizimda topilmadi.\n\n` +
              `Iltimos, avval saytda ro'yxatdan o'tganingizni va raqamingizni to'g'ri kiritganingizni tekshiring.`,
            Markup.removeKeyboard(),
          );
        }
      } catch (error) {
        this.logger.error("[BOT DEBUG] Error in contact handler:", error);
        await ctx
          .reply(
            "❌ Tizimda xatolik yuz berdi. Birozdan so'ng qayta urinib ko'ring.",
          )
          .catch(() => {});
      }
    });

    this.bot.action(/^approve_/, async (ctx: any) => {
      await ctx.answerCbQuery().catch(() => {});
      const data = ctx.callbackQuery.data;
      const userId = data.replace("approve_", "");
      return this.handleApproval(ctx, userId);
    });

    this.bot.action(/^reject_/, async (ctx: any) => {
      await ctx.answerCbQuery().catch(() => {});
      const data = ctx.callbackQuery.data;
      const userId = data.replace("reject_", "");
      return this.handleRejection(ctx, userId);
    });
  }

  // UZ: Faqat ro'yxatga olish bilan bog'liq xabarnomalar qoldirildi

  // Registration notification and approval methods
  async sendRegistrationNotification(user: User): Promise<void> {
    if (!this.bot) {
      this.logger.warn("Bot not initialized");
      return;
    }

    const fullName =
      `${user.lastName || ""} ${user.firstName || ""} ${user.middleName || ""}`.trim();
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
      // Logic:
      // 1. If new user is HR (Kadr) -> Send to Admin only.
      // 2. If new user is NOT HR -> Send to Organization's HR.
      // 3. Fallback: If no HR found in organization, send to Admin (to avoid stuck requests).

      if (user.role === UserRole.HR) {
        // Case 1: New user is HR -> Send to Admin
        if (this.adminChatId) {
          await this.bot.telegram.sendMessage(this.adminChatId, message, {
            parse_mode: "HTML",
            reply_markup: keyboard,
          });
          this.logger.log(
            `Registration notification (HR) sent to Admin for user ${user.id}`,
          );
        } else {
          this.logger.warn(
            `Admin Chat ID not found for HR registration ${user.id}`,
          );
        }
        return;
      }

      // Case 2: New user is NOT HR -> Find Organization's HR
      const hrUsers = await this.userRepository.find({
        where: {
          role: UserRole.HR,
          organization: { id: user.organization?.id },
          isActive: true,
        },
      });

      let sentCount = 0;

      // Send to all found HR users
      for (const hrUser of hrUsers) {
        if (hrUser.telegramChatId) {
          try {
            await this.bot.telegram.sendMessage(
              hrUser.telegramChatId,
              message,
              {
                parse_mode: "HTML",
                reply_markup: keyboard,
              },
            );
            sentCount++;
            this.logger.log(
              `Notification sent to HR user ${hrUser.username} (${hrUser.telegramChatId})`,
            );
          } catch (error) {
            this.logger.error(
              `Failed to send to HR user ${hrUser.username}:`,
              error,
            );
          }
        }
      }

      // Case 3: Fallback (No HR found) -> Send to Admin
      if (sentCount === 0 && this.adminChatId) {
        const adminMessage =
          `⚠️ <b>Tashkilotda Kadr (HR) topilmadi!</b>\n\n` + message;
        await this.bot.telegram.sendMessage(this.adminChatId, adminMessage, {
          parse_mode: "HTML",
          reply_markup: keyboard,
        });
        this.logger.log(
          `No HR users found, fallback sent to Admin for user ${user.id}`,
        );
      } else {
        this.logger.log(
          `Registration notification sent to ${sentCount} HR user(s) for user ${user.id}`,
        );
      }
    } catch (error) {
      this.logger.error("Failed to send registration notification", error);
    }
  }

  private async handleApproval(ctx: any, userId: string) {
    this.logger.log(`Telegram approval request for User ID: ${userId}`);
    try {
      const result = await this.usersService.approveUser(userId);

      if (!result) {
        this.logger.warn(`User not found for approval: ${userId}`);
        await ctx.editMessageText("❌ Foydalanuvchi topilmadi");
        return;
      }

      const { user, password } = result;

      // Update admin message
      const approvalMessage = `
✅ <b>Tasdiqlandi!</b>

👤 <b>Foydalanuvchi:</b> ${user.lastName} ${user.firstName}
🔐 <b>Login:</b> <code>${user.username}</code>
🔑 <b>Parol:</b> <code>${password || "********"}</code>

<i>Foydalanuvchiga ma'lumotlar yuborildi.</i>
      `.trim();

      await ctx
        .editMessageText(approvalMessage, { parse_mode: "HTML" })
        .catch((e) => {
          this.logger.warn(
            `Could not edit message for user ${userId}: ${e.message}`,
          );
        });

      this.logger.log(
        `User approved successfully via Telegram: ${user.username} (User ID: ${userId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to approve user ${userId} via Telegram:`,
        error,
      );
      await ctx.reply("❌ Tasdiqlashda xatolik yuz berdi").catch(() => {});
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

      await ctx
        .editMessageText(rejectionMessage, { parse_mode: "HTML" })
        .catch((e) => {
          this.logger.warn("Could not edit message, might be already edited");
        });

      this.logger.log(`User rejected and deleted: ${userId}`);
    } catch (error) {
      this.logger.error("Failed to reject user:", error);
      await ctx.reply("❌ Rad etishda xatolik yuz berdi").catch(() => {});
    }
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

  async sendActivationNotification(
    user: User,
    password: string,
  ): Promise<void> {
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
        console.log(
          `[BOT DEBUG] Sending to user chat ID: ${user.telegramChatId}`,
        );
        await this.bot.telegram.sendMessage(user.telegramChatId, message, {
          parse_mode: "HTML",
        });
        this.logger.log(
          `Activation notification sent to user ${user.username} (${user.telegramChatId})`,
        );
        return;
      }

      // 2. If user has no chat ID, send to Admin (fallback)
      console.log(
        `[BOT DEBUG] User has no chat ID! Falling back to admin server. adminChatId: ${this.adminChatId}`,
      );
      if (this.adminChatId) {
        const adminMessage = `
⚠️ <b>Foydalanuvchi faollashtirildi, lekin Telegram ID topilmadi.</b>
Login/Parol Adminga yuborilmoqda:

👤 <b>Foydalanuvchi:</b> ${user.lastName} ${user.firstName}
👤 <b>Login:</b> <code>${user.username}</code>
🔑 <b>Parol:</b> <code>${password}</code>
        `.trim();

        await this.bot.telegram.sendMessage(this.adminChatId, adminMessage, {
          parse_mode: "HTML",
        });
        console.log(`[BOT DEBUG] Successfully sent to admin!`);
        this.logger.log(
          `Activation notification sent to ADMIN for user ${user.username}`,
        );
      } else {
        console.log(`[BOT DEBUG] Missing adminChatId in ENV!`);
        this.logger.warn(
          `Could not send activation notification for ${user.username}: No Chat ID and No Admin ID.`,
        );
      }
    } catch (error) {
      this.logger.error(
        `Failed to send activation notification for ${user.username}`,
        error,
      );
    }
  }

  private escapeMarkdown(text: string): string {
    if (!text) return "";
    return text.replace(/[_*[\]()~`># +\-=| {}.!]/g, "\\$&");
  }

  async sendMessageToUser(user: User, message: string): Promise<void> {
    if (!this.bot || !user.telegramChatId) return;

    try {
      await this.bot.telegram.sendMessage(user.telegramChatId, message, {
        parse_mode: "HTML",
      });
      this.logger.log(
        `Message sent to user ${user.username} (${user.telegramChatId})`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to send message to user ${user.username}`,
        error,
      );
    }
  }
  async sendReportNotification(report: any): Promise<void> {
    if (!this.bot || !this.chatId) return;
    const message = `📊 Yangi hisobot: ${report.id}`;
    await this.bot.telegram.sendMessage(this.chatId, message);
  }

  async sendDailyReportWithFiles(
    caption: string,
    pdfPath: string,
    excelPath: string,
  ): Promise<void> {
    if (!this.bot || !this.chatId) return;
    try {
      await this.bot.telegram.sendDocument(this.chatId, {
        source: pdfPath,
        filename: "hisobot.pdf",
      });
      await this.bot.telegram.sendDocument(this.chatId, {
        source: excelPath,
        filename: "hisobot.xlsx",
      });
      await this.bot.telegram.sendMessage(this.chatId, caption);
    } catch (e) {
      this.logger.error("Failed to send daily report with files:", e);
    }
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * async sendReportNotification(report: any): Promise<void> {
 *   if (!this.bot || !this.chatId) return;
 *   const message = `📊 Yangi hisobot: ${report.id}`;
 *   await this.bot.telegram.sendMessage(this.chatId, message);
 * }
 *
 * async sendDailyReportWithFiles(report: any, files: any[]): Promise<void> {
 *   if (!this.bot || !this.chatId) return;
 *   // ... logic for sending files ...
 * }
 *
 * async getDailyStats(): Promise<any> {
 *   // ... logic for stats ...
 * }
 */
