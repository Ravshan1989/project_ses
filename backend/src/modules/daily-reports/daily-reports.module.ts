import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HepatitisDailyReport } from "./entities/hepatitis-daily-report.entity";
import { DailyReportsService } from "./daily-reports.service";
import { DailyReportsController } from "./daily-reports.controller";

import { FluDailyReport } from "./entities/flu-daily-report.entity";
import { AriDailyReport } from "./entities/ari-daily-report.entity";
import { EpidemiologyDailyReport } from "./entities/epidemiology-daily-report.entity";
import { CovidDailyReport } from "./entities/covid-daily-report.entity";
import { DiarrheaDailyReport } from "./entities/diarrhea-daily-report.entity";
import { VerificationService } from "./verification.service";
import { Organization } from "../organizations/entities/organization.entity";
import { SanitaryDailyReport } from "./entities/sanitary-daily-report.entity";

import { ApprovalController } from "./approval.controller";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HepatitisDailyReport,
      FluDailyReport,
      AriDailyReport,
      EpidemiologyDailyReport,
      CovidDailyReport,
      DiarrheaDailyReport,
      Organization,
      SanitaryDailyReport,
    ]),
  ],
  providers: [DailyReportsService, VerificationService],
  controllers: [DailyReportsController, ApprovalController],
  exports: [DailyReportsService, VerificationService],
})
export class DailyReportsModule { }

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 * 
 * Original TypeOrmModule in DailyReportsModule:
 * TypeOrmModule.forFeature([
 *   HepatitisDailyReport,
 *   FluDailyReport,
 *   AriDailyReport,
 *   EpidemiologyDailyReport,
 *   CovidDailyReport,
 *   DiarrheaDailyReport,
 *   Organization,
 * ]),
 */
