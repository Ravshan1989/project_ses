import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExportsService } from "./exports.service";
import { ExportsController } from "./exports.controller";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { VerificationService } from "../daily-reports/verification.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HepatitisDailyReport,
      FluDailyReport,
      AriDailyReport,
      Submission,
    ]),
  ],
  controllers: [ExportsController],
  providers: [ExportsService, VerificationService],
})
export class ExportsModule { }
