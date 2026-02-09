import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { DailyReportsService } from "./daily-reports.service";
import { CreateHepatitisReportDto } from "./dto/create-report.dto";
import { CreateFluReportDto } from "./dto/create-flu-report.dto";
import { CreateAriReportDto } from "./dto/create-ari-report.dto";
import { CreateEpidemiologyReportDto } from "./dto/create-epidemiology-report.dto";
import { CreateCovidReportDto } from "./dto/create-covid-report.dto";

import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("daily-reports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class DailyReportsController {
  constructor(private readonly reportsService: DailyReportsService) { }

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
  @Post("cleanup-test")
  @RequirePermission("MANAGE_DEPARTMENTS") // Republic or higher
  async cleanupTest() {
    return this.reportsService.cleanupTest();
  }

  @Post("bulk-batch")
  async bulkUpsertBatch(@Body() payload: any, @Request() req) {
    return this.reportsService.bulkUpsertBatch(payload, req.user);
  }
}
