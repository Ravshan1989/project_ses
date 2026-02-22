import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChildrenHygieneService } from "./children-hygiene.service";
import { ChildrenHygieneController } from "./children-hygiene.controller";
import { ChSchoolSanitaryReport } from "./entities/ch-school-sanitary-report.entity";
import { ChLabSupervisionReport } from "./entities/ch-lab-supervision-report.entity";
import { ChLabTestsReport } from "./entities/ch-lab-tests-report.entity";
import { ChChemTestsReport } from "./entities/ch-chem-tests-report.entity";
import { ChParasitoMicroReport } from "./entities/ch-parasito-micro-report.entity";
import { ChFinesReport } from "./entities/ch-fines-report.entity";
import { OrganizationsModule } from "../organizations/organizations.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ChSchoolSanitaryReport,
      ChLabSupervisionReport,
      ChLabTestsReport,
      ChChemTestsReport,
      ChParasitoMicroReport,
      ChFinesReport,
    ]),
    OrganizationsModule,
  ],
  controllers: [ChildrenHygieneController],
  providers: [ChildrenHygieneService],
})
export class ChildrenHygieneModule {}
