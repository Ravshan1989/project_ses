import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
  Patch,
} from "@nestjs/common";
import { DailyReportsService } from "./daily-reports.service";
import { CreateHepatitisReportDto } from "./dto/create-report.dto";
import { CreateFluReportDto } from "./dto/create-flu-report.dto";
import { CreateAriReportDto } from "./dto/create-ari-report.dto";
import { CreateEpidemiologyReportDto } from "./dto/create-epidemiology-report.dto";
import { CreateCovidReportDto } from "./dto/create-covid-report.dto";
import { CreateDiarrheaReportDto } from "./dto/create-diarrhea-report.dto";
import { CreateSanitaryReportDto } from "./dto/create-sanitary-report.dto";

import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("daily-reports")
// @UseGuards(JwtAuthGuard, PermissionsGuard)
export class DailyReportsController {
  constructor(private readonly reportsService: DailyReportsService) {}

  @Post()
  async createOrUpdate(@Body() dto: CreateHepatitisReportDto, @Request() req) {
    return this.reportsService.upsert(dto, req.user);
  }

  @Get()
  @RequirePermission("VIEW_HEPATITIS")
  async getByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getByDate(date, req.user, isTest === "true");
  }

  @Post("flu")
  async createOrUpdateFlu(@Body() dto: CreateFluReportDto, @Request() req) {
    return this.reportsService.upsertFlu(dto, req.user);
  }

  @Get("flu")
  @RequirePermission("VIEW_FLU")
  async getFluByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getFluByDate(date, req.user, isTest === "true");
  }

  @Post("ari")
  async createOrUpdateAri(@Body() dto: CreateAriReportDto, @Request() req) {
    return this.reportsService.upsertAri(dto, req.user);
  }

  @Get("ari")
  @RequirePermission("VIEW_FLU")
  async getAriByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getAriByDate(date, req.user, isTest === "true");
  }

  @Get("weekly-summary")
  @RequirePermission("VIEW_WEEKLY_SUMMARY")
  async getWeeklySummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getWeeklySummary(
      startDate,
      endDate,
      req.user,
      isTest === "true",
    );
  }

  @Post("epidemiology")
  async createOrUpdateEpidemiology(
    @Body() dto: CreateEpidemiologyReportDto,
    @Request() req,
  ) {
    return this.reportsService.upsertEpidemiology(dto, req.user);
  }

  @Get("epidemiology")
  @RequirePermission("VIEW_EPIDEMIOLOGY")
  async getEpidemiologyByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getEpidemiologyByDate(
      date,
      req.user,
      isTest === "true",
    );
  }

  @Post("sanitary")
  async createOrUpdateSanitary(
    @Body() dto: CreateSanitaryReportDto,
    @Request() req,
  ) {
    return this.reportsService.upsertSanitary(dto, req.user);
  }

  @Get("sanitary")
  @RequirePermission("VIEW_SANITARY")
  async getSanitaryByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getSanitaryByDate(
      date,
      req.user,
      isTest === "true",
    );
  }

  @Post("covid")
  async createOrUpdateCovid(@Body() dto: CreateCovidReportDto, @Request() req) {
    return this.reportsService.upsertCovid(dto, req.user);
  }

  @Get("covid")
  @RequirePermission("VIEW_COVID")
  async getCovidByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getCovidByDate(
      date,
      req.user,
      isTest === "true",
    );
  }

  @Get("diarrhea")
  @RequirePermission("VIEW_HEPATITIS") // O'tkir diareya ham gepatitga o'xshash bo'limga tegishli bo'lishi mumkin
  async getDiarrheaByDate(
    @Query("date") date: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.reportsService.getDiarrheaByDate(
      date,
      req.user,
      isTest === "true",
    );
  }

  @Post("diarrhea")
  async createOrUpdateDiarrhea(
    @Body() dto: CreateDiarrheaReportDto,
    @Request() req,
  ) {
    return this.reportsService.upsertDiarrhea(dto, req.user);
  }
  @Post("cleanup-test")
  // @RequirePermission("MANAGE_DEPARTMENTS") // Republic or higher
  async cleanupTest() {
    return this.reportsService.cleanupTest();
  }

  @Post("bulk-batch")
  async bulkUpsertBatch(@Body() payload: any, @Request() req) {
    return this.reportsService.bulkUpsertBatch(payload, req.user);
  }

  @Patch(":type/:id/submit")
  async submit(@Request() req, @Body() body) {
    // Note: type and id are from params, but NestJS syntax needs @Param
    return this.reportsService.submit(req.params.type, req.params.id, req.user);
  }

  @Patch(":type/:id/verify")
  @RequirePermission("VERIFY_REPORT")
  async verify(@Request() req) {
    return this.reportsService.verify(req.params.type, req.params.id, req.user);
  }

  @Patch(":type/:id/approve")
  @RequirePermission("APPROVE_REPORT")
  async approve(@Request() req) {
    return this.reportsService.approve(
      req.params.type,
      req.params.id,
      req.user,
    );
  }

  @Patch(":type/:id/reject")
  @RequirePermission("VERIFY_REPORT")
  async reject(@Request() req, @Body() body: { comment?: string }) {
    return this.reportsService.reject(
      req.params.type,
      req.params.id,
      req.user,
      body.comment,
    );
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * Modified methods in DailyReportsController:
 * - Added POST /daily-reports/sanitary
 * - Added GET /daily-reports/sanitary (RequirePermission: VIEW_SANITARY)
 */
