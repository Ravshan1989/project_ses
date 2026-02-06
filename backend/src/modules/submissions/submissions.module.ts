import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubmissionsService } from "./submissions.service";
import { SubmissionsController } from "./submissions.controller";
import { Submission } from "./entities/submission.entity";
import { DailyReportsModule } from "../daily-reports/daily-reports.module";
import { DiseasesModule } from "../diseases/diseases.module";
import { OrganizationsModule } from "../organizations/organizations.module";
import { Template } from "../forms/entities/template.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission, Template]),
    DailyReportsModule,
    DiseasesModule,
    OrganizationsModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule { }
