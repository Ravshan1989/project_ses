import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubmissionsService } from "./submissions.service";
import { SubmissionsController } from "./submissions.controller";
import { Submission } from "./entities/submission.entity";
import { FieldInspection } from "./entities/field-inspection.entity";
import { DailyReportsModule } from "../daily-reports/daily-reports.module";
import { DiseasesModule } from "../diseases/diseases.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { Template } from "../forms/entities/template.entity";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Template, FieldInspection]),
    DailyReportsModule,
    DiseasesModule,
    OrganizationsModule,
    TelegramModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule {}
