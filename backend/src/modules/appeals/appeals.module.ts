import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppealsService } from "./appeals.service";
import { AppealsController } from "./appeals.controller";
import { AppealsTable1 } from "./entities/appeals-table-1.entity";
import { AppealsTable2 } from "./entities/appeals-table-2.entity";
import { AppealsTable3 } from "./entities/appeals-table-3.entity";
import { AppealsTable4 } from "./entities/appeals-table-4.entity";
import { AppealsTable5 } from "./entities/appeals-table-5.entity";
import { AppealsTable6 } from "./entities/appeals-table-6.entity";
import { AppealsTable7 } from "./entities/appeals-table-7.entity";
import { AppealRecord } from "./entities/appeal-record.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { AppealsReminderService } from "./appeals-reminder.service";
import { AppealsImportService } from "./appeals-import.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppealsTable1,
      AppealsTable2,
      AppealsTable3,
      AppealsTable4,
      AppealsTable5,
      AppealsTable6,
      AppealsTable7,
      AppealRecord,
      Organization,
    ]),
  ],
  providers: [AppealsService, AppealsReminderService, AppealsImportService],
  controllers: [AppealsController],
  exports: [AppealsService],
})
export class AppealsModule {}
