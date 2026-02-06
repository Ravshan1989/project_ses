import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SubmissionsService } from "./submissions.service";
import { SubmissionsController } from "./submissions.controller";
import { Submission } from "./entities/submission.entity";
import { DailyReportsModule } from "../daily-reports/daily-reports.module";
import { DiseasesModule } from "../diseases/diseases.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([Submission]),
    DailyReportsModule,
    DiseasesModule,
  ],
  controllers: [SubmissionsController],
  providers: [SubmissionsService],
  exports: [SubmissionsService],
})
export class SubmissionsModule { }
