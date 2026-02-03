import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ImportsService } from './imports.service';
import { ImportsController } from './imports.controller';
import { HepatitisDailyReport } from '../daily-reports/entities/hepatitis-daily-report.entity';
import { FluDailyReport } from '../daily-reports/entities/flu-daily-report.entity';
import { Organization } from '../organizations/entities/organization.entity';
import { Template } from '../forms/entities/template.entity';
import { Submission } from '../submissions/entities/submission.entity';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            HepatitisDailyReport,
            FluDailyReport,
            Organization,
            Submission,
            Template
        ])
    ],
    controllers: [ImportsController],
    providers: [ImportsService],
})
export class ImportsModule { }
