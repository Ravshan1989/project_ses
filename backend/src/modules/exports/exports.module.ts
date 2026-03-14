import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ExportsService } from "./exports.service";
import { ExportsController } from "./exports.controller";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "../daily-reports/entities/covid-daily-report.entity";
import { EpidemiologyDailyReport } from "../daily-reports/entities/epidemiology-daily-report.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { FieldInspection } from "../submissions/entities/field-inspection.entity";
import { VerificationService } from "../daily-reports/verification.service";
import { DiseasesModule } from "../diseases/diseases.module";
import { OrganizationsModule } from "../organizations/organizations.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HepatitisDailyReport,
      FluDailyReport,
      AriDailyReport,
      CovidDailyReport,
      EpidemiologyDailyReport,
      Submission,
      FieldInspection,
    ]),
    DiseasesModule,
    OrganizationsModule,
  ],
  controllers: [ExportsController],
  providers: [ExportsService, VerificationService],
  exports: [ExportsService],
})
export class ExportsModule { }
