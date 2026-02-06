import { Controller, Get, Query, UseGuards, Request, Res } from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { ExportsService } from "./exports.service";

@Controller("exports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) { }

  @Get("flu")
  @RequirePermission("VIEW_FLU")
  async getFluReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req
  ) {
    return this.exportsService.getFluReports(startDate, endDate, isTest === 'true', req.user);
  }

  @Get("hepatitis")
  @RequirePermission("VIEW_HEPATITIS")
  async getHepatitisReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req
  ) {
    return this.exportsService.getHepatitisReports(startDate, endDate, isTest === 'true', req.user);
  }

  @Get("form1")
  @RequirePermission("VIEW_FORM1_TABLE1")
  async getForm1Reports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req
  ) {
    return this.exportsService.getForm1Reports(startDate, endDate, isTest === 'true', req.user);
  }

  @Get("flu/excel")
  @RequirePermission("VIEW_FLU")
  async exportFluExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req,
    @Res() res: Response
  ) {
    return this.exportsService.exportFluToExcel(res, startDate, endDate, isTest === 'true', req.user);
  }

  @Get("hepatitis/excel")
  @RequirePermission("VIEW_HEPATITIS")
  async exportHepatitisExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Request() req,
    @Res() res: Response
  ) {
    return this.exportsService.exportHepatitisToExcel(res, startDate, endDate, isTest === 'true', req.user);
  }
}
