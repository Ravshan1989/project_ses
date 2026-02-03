import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { HepatitisDailyReport } from "./entities/hepatitis-daily-report.entity";
import { DailyReportsService } from "./daily-reports.service";
import { DailyReportsController } from "./daily-reports.controller";

import { FluDailyReport } from "./entities/flu-daily-report.entity";
import { AriDailyReport } from "./entities/ari-daily-report.entity";
import { EpidemiologyDailyReport } from "./entities/epidemiology-daily-report.entity";
import { CovidDailyReport } from "./entities/covid-daily-report.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HepatitisDailyReport,
      FluDailyReport,
      AriDailyReport,
      EpidemiologyDailyReport,
      CovidDailyReport,
    ]),
  ],
  providers: [DailyReportsService],
  controllers: [DailyReportsController],
  exports: [DailyReportsService],
})
export class DailyReportsModule {}
