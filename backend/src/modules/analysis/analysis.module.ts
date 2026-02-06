import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AnalysisService } from "./analysis.service";
import { AnalysisController } from "./analysis.controller";
import { ForecastingService } from "./forecasting.service"; // UZ: Bashorat qilish xizmati
import { Organization } from "../organizations/entities/organization.entity";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "../daily-reports/entities/covid-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { Disease } from "../diseases/entities/disease.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Organization,
      HepatitisDailyReport,
      FluDailyReport,
      AriDailyReport,
      CovidDailyReport,
      Submission,
      Disease,
    ]),
  ],
  controllers: [AnalysisController],
  providers: [
    AnalysisService,
    ForecastingService, // UZ: ForecastingService qo'shildi
  ],
  exports: [
    AnalysisService,
    ForecastingService, // UZ: Tashqi modullar uchun export qilindi
  ],
})
export class AnalysisModule { }
