import { Module, Global, forwardRef } from '@nestjs/common';
import { TelegramService } from './telegram.service';
import { DailyReportsModule } from '../daily-reports/daily-reports.module';

@Global()
@Module({
    imports: [forwardRef(() => DailyReportsModule)],
    providers: [TelegramService],
    exports: [TelegramService],
})
export class TelegramModule { }
