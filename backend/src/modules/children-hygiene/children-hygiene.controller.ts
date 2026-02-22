import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { ChildrenHygieneService } from "./children-hygiene.service";
import { SaveChSchoolSanitaryReportDto } from "./dto/ch-school-sanitary-report.dto";
import { SaveChLabSupervisionReportDto } from "./dto/ch-lab-supervision-report.dto";
import { SaveChLabTestsReportDto } from "./dto/ch-lab-tests-report.dto";
import { SaveChChemTestsReportDto } from "./dto/ch-chem-tests-report.dto";
import { SaveChParasitoMicroReportDto } from "./dto/ch-parasito-micro-report.dto";
import { SaveChFinesReportDto } from "./dto/ch-fines-report.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("children-hygiene")
@UseGuards(JwtAuthGuard)
export class ChildrenHygieneController {
  constructor(private readonly service: ChildrenHygieneService) {}

  @Get("table1")
  getTable1Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable1Report(month, orgId);
  }
  @Post("table1")
  saveTable1Report(@Body() dto: SaveChSchoolSanitaryReportDto) {
    return this.service.saveTable1Report(dto);
  }

  @Get("table2")
  getTable2Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable2Report(month, orgId);
  }
  @Post("table2")
  saveTable2Report(@Body() dto: SaveChLabSupervisionReportDto) {
    return this.service.saveTable2Report(dto);
  }

  @Get("table3")
  getTable3Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable3Report(month, orgId);
  }
  @Post("table3")
  saveTable3Report(@Body() dto: SaveChLabTestsReportDto) {
    return this.service.saveTable3Report(dto);
  }

  @Get("table3-1")
  getTable3_1Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable3_1Report(month, orgId);
  }
  @Post("table3-1")
  saveTable3_1Report(@Body() dto: SaveChChemTestsReportDto) {
    return this.service.saveTable3_1Report(dto);
  }

  @Get("table3-2")
  getTable3_2Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable3_2Report(month, orgId);
  }
  @Post("table3-2")
  saveTable3_2Report(@Body() dto: SaveChParasitoMicroReportDto) {
    return this.service.saveTable3_2Report(dto);
  }

  @Get("table4")
  getTable4Report(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
  ) {
    return this.service.getTable4Report(month, orgId);
  }
  @Post("table4")
  saveTable4Report(@Body() dto: SaveChFinesReportDto) {
    return this.service.saveTable4Report(dto);
  }

  @Get("regional-status")
  getRegionalStatus(@Query("month") month: string) {
    return this.service.getRegionalStatus(month);
  }
}
