import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { InspectionsService } from "./inspections.service";
import { InspectionsController } from "./inspections.controller";
import { InspectionRecord } from "./entities/inspection-record.entity";
import { InspectionTable2 } from "./entities/inspection-table2.entity";
import { InspectionTable3 } from "./entities/inspection-table3.entity";
import { InspectionTable4 } from "./entities/inspection-table4.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InspectionRecord,
      InspectionTable2,
      InspectionTable3,
      InspectionTable4,
    ]),
  ],
  providers: [InspectionsService],
  controllers: [InspectionsController],
  exports: [InspectionsService],
})
export class InspectionsModule {}
