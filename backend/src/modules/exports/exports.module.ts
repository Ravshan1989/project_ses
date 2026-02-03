import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsService } from './exports.service';
import { ExportsController } from './exports.controller';
import { HepatitisDailyReport } from '../daily-reports/entities/hepatitis-daily-report.entity';
import { FluDailyReport } from '../daily-reports/entities/flu-daily-report.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HepatitisDailyReport,
            FluDailyReport,
            Submission
        ])
    ],
    controllers: [ExportsController],
    providers: [ExportsService],
})
export class ExportsModule { }
