import { Module, Global, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DailyReportsModule } from '../daily-reports/daily-reports.module';

import { DataExportService } from './data-export.service';
import { BackupBotService } from './backup-bot.service';

@Global()
@Module({
    imports: [forwardRef(() => DailyReportsModule)],
    providers: [TelegramService, DataExportService, BackupBotService],
    exports: [TelegramService, DataExportService],
})
export class TelegramModule { }
