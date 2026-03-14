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
import { SubmissionsService } from "../submissions/submissions.service";
import * as fs from "fs";
import * as path from "path";
import { FieldInspectionType, InspectionResult } from "../submissions/entities/field-inspection.entity";

@Injectable()
export class TelegramService implements OnModuleInit {
  private bot: Telegraf;
  private readonly logger = new Logger(TelegramService.name);
  private chatId: string;
  private adminChatId: string;
  private systemUser: User;
  private userStates: Map<number, {
    step: string;
    data: any;
    timeout?: NodeJS.Timeout;
  }> = new Map();

  constructor(
    private configService: ConfigService,
    @Inject(forwardRef(() => DailyReportsService))
    private dailyReportsService: DailyReportsService,
    @Inject(forwardRef(() => SubmissionsService))
    private submissionsService: SubmissionsService,
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
    this.setupReportingHandlers();

    // Set bot commands menu
    this.bot.telegram.setMyCommands([
      { command: "start", description: "Botni ishga tushirish / Menyuni ochish" },
      { command: "report", description: "Yangi hisobot yuborish" },
      { command: "help", description: "Yordam olish" },
    ]);

    // UZ: Webhookni o'chirish (agar oldin o'rnatilgan bo'lsa) va Pollingni boshlash
    this.bot.telegram
      .deleteWebhook()
      .then(() => {
        this.bot
          .launch()
          .then(() => {
            this.logger.log(
              "Telegram bot polling rejimda ishga tushdi (Webhook o'chirildi).",
            );
          })
          .catch((err) => {
            this.logger.error("Telegram bot ishga tushirishda xatolik:", err);
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

      // Check if user came from registration
      const startPayload = ctx.startPayload;
      if (startPayload) {
        try {
          const user = await this.userRepository.findOne({
            where: { id: startPayload },
            relations: ["organization"],
          });

          if (user) {
            return ctx.reply(
              `Assalomu alaykum!\n\n` +
              `Davom etish uchun telefon raqamingizni tasdiqlang.`,
              Markup.keyboard([
                [Markup.button.contactRequest("📞 Telefon raqamni yuborish")],
              ]).resize(),
            );
          }
        } catch (error) {
          this.logger.error("Error processing /start with payload:", error);
        }
      }

      return this.showMainMenu(ctx);
    });

    // Listen for menu buttons
    this.bot.hears("📊 Yangi hisobot", async (ctx) => {
      return ctx.reply("Hisobot yuborishni boshlash uchun /report buyrug'ini bosing yoki quyidagi tugmani bosing.",
        Markup.inlineKeyboard([[Markup.button.callback("Start Reporting", "start_report")]]));
    });

    this.bot.hears("📅 Bugungi statistika", async (ctx) => {
      return this.dailyReportsService.generateAutomatedDailyReport();
    });

    // Handle phone number verification
    this.bot.on("contact", async (ctx) => {
      const contact = ctx.message.contact;
      const phoneNumber = contact.phone_number;

      this.logger.log(`Received phone number: ${phoneNumber} from ${ctx.from.id}`);

      try {
        const user = await this.userRepository.findOne({
          where: { phoneNumber: phoneNumber.replace(/\D/g, "") },
          relations: ["organization"],
        });

        if (user) {
          user.telegramChatId = ctx.from.id.toString();
          await this.userRepository.save(user);

          await ctx.reply(
            `✅ Tasdiqlandi!\n\n` +
            `Assalomu alaykum, ${user.firstName}!\n\n` +
            `Siz muvaffaqiyatli ro'yxatdan o'tdingiz.\n` +
            `Ma'mulotlaringiz tekshirilmoqda.\n\n` +
            `${user.organization?.name || "Tashkilot"} kadri tasdiqlashidan so'ng login va parol yuboriladi.`,
            Markup.removeKeyboard(),
          );
        } else {
          await ctx.reply(`❌ Xatolik! Bu telefon raqam tizimda topilmadi.`, Markup.removeKeyboard());
        }
      } catch (error) {
        this.logger.error("Error verifying phone number:", error);
      }
    });

    this.bot.action("get_hep", (ctx) => this.handleReportRequest(ctx, "hep"));
    this.bot.action("get_covid", (ctx) => this.handleReportRequest(ctx, "covid"));
    this.bot.action("get_flu", (ctx) => this.handleReportRequest(ctx, "flu"));
    this.bot.action("get_ari", (ctx) => this.handleReportRequest(ctx, "ari"));
    this.bot.action("get_epi", (ctx) => this.handleReportRequest(ctx, "epi"));
    this.bot.action("get_sanitary", (ctx) => this.handleReportRequest(ctx, "sanitary"));

    this.bot.action("verify_phone", async (ctx) => {
      await ctx.reply(`Davom etish uchun telefon raqamingizni tasdiqlang.`,
        Markup.keyboard([[Markup.button.contactRequest("📞 Telefon raqamni yuborish")]]).resize(),
      );
    });

    this.bot.action(/^approve_/, (ctx) => {
      const userId = ctx.match[0].replace("approve_", "");
      return this.handleApproval(ctx, userId);
    });

    this.bot.action(/^reject_/, (ctx) => {
      const userId = ctx.match[0].replace("reject_", "");
      return this.handleRejection(ctx, userId);
    });
  }

  private async showMainMenu(ctx: any) {
    return ctx.reply(
      "Assalomu alaykum! SMART SES tizimining rasmiy botiga xush kelibsiz. Kerakli bo'limni tanlang:",
      Markup.keyboard([
        ["📊 Yangi hisobot"],
        ["📅 Bugungi statistika", "🏢 Ma'lumotlarim"],
        ["📞 Aloqa"]
      ]).resize()
    );
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
          message += `🏢 *${orgName}:* Holati: ${r.status}\n`;
        });
      } else if (type === "sanitary") {
        const data = await this.dailyReportsService.getSanitaryByDate(
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
          [
            Markup.button.callback("🟣 Epidemiologiya", "get_epi"),
            Markup.button.callback("🏥 Sanitariya", "get_sanitary"),
          ],
          [
            Markup.button.callback(
              "🔐 Ro'yxatdan o'tishni tasdiqlash",
              "verify_phone",
            ),
          ],
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
      const username = await this.generateUniqueUsername(user);
      const password = this.generatePassword();
      const salt = await bcrypt.genSalt();
      const passwordHash = await bcrypt.hash(password, salt);

      // Update user
      user.username = username;
      user.passwordHash = passwordHash;
      user.isActive = true;
      user.approvedAt = new Date();

      await this.userRepository.save(user);

      // Send credentials to user
      await this.sendActivationNotification(user, password);

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

  private async generateUniqueUsername(user: User): Promise<string> {
    const firstName =
      user.firstName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "user";
    const lastName =
      user.lastName?.toLowerCase().replace(/[^a-z0-9]/g, "") || "";

    let baseUsername = `${firstName}.${lastName}`;
    if (!lastName) baseUsername = firstName;

    // Check if base username exists
    const exists = await this.userRepository.findOne({
      where: { username: baseUsername },
    });
    if (!exists) return baseUsername;

    // If exists, append random number
    let isUnique = false;
    let newUsername = baseUsername;
    while (!isUnique) {
      const randomSuffix = Math.floor(1000 + Math.random() * 9000); // 4 digit random
      newUsername = `${baseUsername}${randomSuffix}`;
      const check = await this.userRepository.findOne({
        where: { username: newUsername },
      });
      if (!check) isUnique = true;
    }

    return newUsername;
  }

  private generatePassword(): string {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
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
        await this.bot.telegram.sendMessage(user.telegramChatId, message, {
          parse_mode: "HTML",
        });
        this.logger.log(
          `Activation notification sent to user ${user.username} (${user.telegramChatId})`,
        );
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

        await this.bot.telegram.sendMessage(this.adminChatId, adminMessage, {
          parse_mode: "HTML",
        });
        this.logger.log(
          `Activation notification sent to ADMIN for user ${user.username}`,
        );
      } else {
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

  async sendDailyReportWithFiles(text: string, pdfPath: string, excelPath: string) {
    if (!this.adminChatId) {
      this.logger.warn("Admin chat ID not set, skipping daily report.");
      return;
    }

    try {
      if (text) {
        await this.bot.telegram.sendMessage(this.adminChatId, text, {
          parse_mode: "Markdown",
        });
      }

      const files = [];
      if (excelPath && fs.existsSync(excelPath)) {
        files.push({ source: excelPath, filename: path.basename(excelPath) });
      }

      for (const file of files) {
        await this.bot.telegram.sendDocument(this.adminChatId, file);
      }
    } catch (error) {
      this.logger.error("Kunlik hisobotni yuborishda xatolik:", error);
    }
  }

  private setupReportingHandlers() {
    // Action for inline button from menu
    this.bot.action("start_report", (ctx) => {
      return (this.bot as any).handleUpdate({
        message: { text: "/report", from: ctx.from, chat: ctx.chat },
      });
    });

    // 1. Start command /report
    this.bot.command("report", async (ctx) => {
      const user = await this.userRepository.findOne({
        where: { telegramChatId: ctx.from.id.toString() },
        relations: ["organization"],
      });

      if (!user) {
        return ctx.reply(
          "Siz tizimda ro'yxatdan o'tmagansiz. Iltimos /start buyrug'ini bosing.",
        );
      }

      this.userStates.set(ctx.from.id, {
        step: "TYPE",
        data: { inspector: user, organization: user.organization },
      });

      return ctx.reply(
        "Hisobot turini tanlang:",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🏫 Maktab", "type_SCHOOL"),
            Markup.button.callback("🎈 Bog'cha", "type_KINDERGARTEN"),
          ],
          [Markup.button.callback("⚠️ Muammo", "type_PROBLEM")],
        ]),
      );
    });

    // 2. Handle type selection
    this.bot.action(/^type_/, async (ctx) => {
      const type = ctx.match[0].replace("type_", "");
      const state = this.userStates.get(ctx.from.id);
      if (!state) return;

      state.data.type = type;
      state.step = "OBJECT_NAME";

      await ctx.answerCbQuery();
      return ctx.editMessageText("Ob'ekt nomini kiriting (masalan: 12-maktab):");
    });

    // 3. Handle messages (Object name, Photo)
    this.bot.on("text", async (ctx, next) => {
      const state = this.userStates.get(ctx.from.id);
      if (!state || state.step !== "OBJECT_NAME") return next();

      state.data.objectName = ctx.message.text;
      state.step = "LOCATION";

      return ctx.reply(
        "📍 Joylashuvingizni yuboring (GPS):",
        Markup.keyboard([
          Markup.button.locationRequest("📍 Manzilni yuborish"),
        ]).resize(),
      );
    });

    // 4. Handle location
    this.bot.on("location", async (ctx) => {
      const state = this.userStates.get(ctx.from.id);
      if (!state || state.step !== "LOCATION") return;

      state.data.latitude = ctx.message.location.latitude;
      state.data.longitude = ctx.message.location.longitude;
      state.step = "PHOTO";

      return ctx.reply(
        "📸 Ob'ektdan rasm yuboring (yoki /skip buyrug'ini bosing):",
        Markup.removeKeyboard(),
      );
    });

    this.bot.command("skip", async (ctx) => {
      const state = this.userStates.get(ctx.from.id);
      if (!state || state.step !== "PHOTO") return;

      state.step = "RESULT";
      return ctx.reply(
        "Tekshiruv natijasini tanlang:",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🟢 Yaxshi", "res_GOOD"),
            Markup.button.callback("🟠 Qoniqarli", "res_SATISFACTORY"),
          ],
          [Markup.button.callback("🔴 Qoniqarsiz", "res_UNSATISFACTORY")],
        ]),
      );
    });

    // 5. Handle photo
    this.bot.on("photo", async (ctx) => {
      const state = this.userStates.get(ctx.from.id);
      if (!state || state.step !== "PHOTO") return;

      const photo = ctx.message.photo[ctx.message.photo.length - 1];
      const link = await this.bot.telegram.getFileLink(photo.file_id);
      state.data.photoUrl = link.href;

      state.step = "RESULT";
      return ctx.reply(
        "Tekshiruv natijasini tanlang:",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("🟢 Yaxshi", "res_GOOD"),
            Markup.button.callback("🟠 Qoniqarli", "res_SATISFACTORY"),
          ],
          [Markup.button.callback("🔴 Qoniqarsiz", "res_UNSATISFACTORY")],
        ]),
      );
    });

    // 6. Handle result selection
    this.bot.action(/^res_/, async (ctx) => {
      const result = ctx.match[0].replace("res_", "");
      const state = this.userStates.get(ctx.from.id);
      if (!state) return;

      state.data.result = result;
      state.step = "MEASURES";

      await ctx.answerCbQuery();
      return ctx.editMessageText(
        "Ma'muriy chora qo'llanilganmi?",
        Markup.inlineKeyboard([
          [
            Markup.button.callback("✅ Ha", "meas_true"),
            Markup.button.callback("❌ Yo'q", "meas_false"),
          ],
        ]),
      );
    });

    // 7. Handle administrative measures
    this.bot.action(/^meas_/, async (ctx) => {
      const hasMeasures = ctx.match[0].replace("meas_", "") === "true";
      const state = this.userStates.get(ctx.from.id);
      if (!state) return;

      state.data.hasAdministrativeMeasures = hasMeasures;

      try {
        const inspector = state.data.inspector as User;
        await this.submissionsService.saveFieldInspection({
          ...state.data,
          inspectorName: `${inspector.firstName} ${inspector.lastName} `,
          districtName: inspector.organization?.name || "Noma'lum",
        });

        this.userStates.delete(ctx.from.id);
        await ctx.answerCbQuery();
        return ctx.editMessageText(
          "✅ Hisobot muvaffaqiyatli saqlandi! Rahmat.",
        );
      } catch (error) {
        this.logger.error("Hisobotni saqlashda xatolik:", error);
        return ctx.reply("❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring.");
      }
    });
  }

  private escapeMarkdown(text: string): string {
    if (!text) return "";
    return text.replace(/[_*[\]()~`># +\-=| {}.!]/g, "\\$&");
  }
}
