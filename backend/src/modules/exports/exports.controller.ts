import { Controller, Get, Query } from "@nestjs/common";
import { ExportsService } from "./exports.service";

@Controller("exports")
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get("flu")
  async getFluReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.exportsService.getFluReports(startDate, endDate);
  }

  @Get("hepatitis")
  async getHepatitisReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.exportsService.getHepatitisReports(startDate, endDate);
  }

  @Get("form1")
  async getForm1Reports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.exportsService.getForm1Reports(startDate, endDate);
  }
}
