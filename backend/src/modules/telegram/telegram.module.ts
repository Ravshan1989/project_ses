import { Module, Global, forwardRef } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { DailyReportsModule } from "../daily-reports/daily-reports.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";

import { DataExportService } from "./data-export.service";
import { BackupBotService } from "./backup-bot.service";
import { SosBotService } from "./sos-bot.service";

@Global()
@Module({
  imports: [
    forwardRef(() => DailyReportsModule),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [
    TelegramService,
    DataExportService,
    BackupBotService,
    SosBotService,
  ],
  exports: [TelegramService, DataExportService, SosBotService],
})
export class TelegramModule {}
