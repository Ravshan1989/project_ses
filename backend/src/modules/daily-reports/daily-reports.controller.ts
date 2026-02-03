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

@Controller("daily-reports")
export class DailyReportsController {
  constructor(private readonly reportsService: DailyReportsService) {}

  @Post()
  async createOrUpdate(@Body() dto: CreateHepatitisReportDto) {
    return this.reportsService.upsert(dto);
  }

  @Get()
  async getByDate(@Query("date") date: string) {
    return this.reportsService.getByDate(date);
  }

  @Post("flu")
  async createOrUpdateFlu(@Body() dto: CreateFluReportDto) {
    return this.reportsService.upsertFlu(dto);
  }

  @Get("flu")
  async getFluByDate(@Query("date") date: string) {
    return this.reportsService.getFluByDate(date);
  }

  @Post("ari")
  async createOrUpdateAri(@Body() dto: CreateAriReportDto) {
    return this.reportsService.upsertAri(dto);
  }

  @Get("ari")
  async getAriByDate(@Query("date") date: string) {
    return this.reportsService.getAriByDate(date);
  }

  @Get("weekly-summary")
  async getWeeklySummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.reportsService.getWeeklySummary(startDate, endDate);
  }

  @Post("epidemiology")
  async createOrUpdateEpidemiology(@Body() dto: CreateEpidemiologyReportDto) {
    return this.reportsService.upsertEpidemiology(dto);
  }

  @Get("epidemiology")
  async getEpidemiologyByDate(@Query("date") date: string) {
    return this.reportsService.getEpidemiologyByDate(date);
  }

  @Post("covid")
  async createOrUpdateCovid(@Body() dto: CreateCovidReportDto) {
    return this.reportsService.upsertCovid(dto);
  }

  @Get("covid")
  async getCovidByDate(@Query("date") date: string) {
    return this.reportsService.getCovidByDate(date);
  }
}
