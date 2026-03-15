import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, LessThanOrEqual, IsNull } from "typeorm";
import { Cron, CronExpression } from "@nestjs/schedule";
import { AppealRecord, AppealStatus } from "./entities/appeal-record.entity";
import { TelegramService } from "../telegram/telegram.service";
import * as dayjs from "dayjs";

@Injectable()
export class AppealsReminderService {
  private readonly logger = new Logger(AppealsReminderService.name);

  constructor(
    @InjectRepository(AppealRecord)
    private readonly recordRepo: Repository<AppealRecord>,
    private readonly telegramService: TelegramService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async checkDeadlines() {
    this.logger.log("Murojaatlar muddatini tekshirish boshlandi...");

    // 1. Muddati yaqinlashayotgan murojaatlarni topish (14 kun oldin kiritilgan)
    // O'zbekistonda murojaatlar odatda 15 kunda ko'rib chiqilishi kerak
    const deadlineThreshold = dayjs().subtract(14, "day").format("YYYY-MM-DD");

    const pendingAppeals = await this.recordRepo.find({
      where: {
        status: AppealStatus.BEING_CONSIDERED,
        registration_date: LessThanOrEqual(deadlineThreshold),
      },
      relations: ["createdBy", "organization"],
    });

    this.logger.log(
      `${pendingAppeals.length} ta muddati yaqinlashayotgan murojaat topildi.`,
    );

    for (const appeal of pendingAppeals) {
      if (appeal.createdBy && appeal.createdBy.telegramChatId) {
        const message = `
⚠️ <b>MUROJAAT MUDDATI YAQINLASHMOQDA!</b>

👤 <b>Murojaatchi:</b> ${appeal.applicant_name}
📅 <b>Ro'yxatga olingan:</b> ${appeal.registration_date}
🏢 <b>Tashkilot:</b> ${appeal.organization?.name || "Noma'lum"}
📝 <b>Mazmuni:</b> ${appeal.summary?.substring(0, 100) || "..."}...

<i>Ushbu murojaatni ko'rib chiqish muddati tugashiga 1 kun qoldi. Iltimos, choralar ko'ring!</i>
                `.trim();

        await this.telegramService.sendMessageToUser(appeal.createdBy, message);
      }
    }
  }
}
