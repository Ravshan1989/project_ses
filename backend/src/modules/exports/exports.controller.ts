import {
  Controller,
  Get,
  Query,
  UseGuards,
  Request,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { ExportsService } from "./exports.service";

@Controller("exports")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ExportsController {
  constructor(private readonly exportsService: ExportsService) {}

  @Get("flu")
  @RequirePermission("VIEW_FLU")
  async getFluReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string, // New param
    @Request() req,
  ) {
    return this.exportsService.getFluReports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("hepatitis")
  @RequirePermission("VIEW_HEPATITIS")
  async getHepatitisReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
  ) {
    return this.exportsService.getHepatitisReports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("form1")
  @RequirePermission("VIEW_FORM1_TABLE1")
  async getForm1Reports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
  ) {
    return this.exportsService.getForm1Reports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("ari")
  @RequirePermission("VIEW_ARI")
  async getAriReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
  ) {
    return this.exportsService.getAriReports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("covid")
  @RequirePermission("VIEW_COVID")
  async getCovidReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
  ) {
    return this.exportsService.getCovidReports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("epidemiology")
  @RequirePermission("VIEW_EPIDEMIOLOGY")
  async getEpidemiologyReports(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
  ) {
    return this.exportsService.getEpidemiologyReports(
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("form1/excel")
  @RequirePermission("VIEW_FORM1_TABLE1")
  async exportForm1Excel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    return this.exportsService.exportForm1ToExcel(
      res,
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("flu/excel")
  @RequirePermission("VIEW_FLU")
  async exportFluExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    return this.exportsService.exportFluToExcel(
      res,
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("ari/excel")
  @RequirePermission("VIEW_ARI")
  async exportAriExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    return this.exportsService.exportAriToExcel(
      res,
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }

  @Get("hepatitis/excel")
  @RequirePermission("VIEW_HEPATITIS")
  async exportHepatitisExcel(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Query("isTest") isTest: string,
    @Query("districtId") districtId: string,
    @Request() req,
    @Res() res: Response,
  ) {
    return this.exportsService.exportHepatitisToExcel(
      res,
      startDate,
      endDate,
      isTest === "true",
      req.user,
      districtId,
    );
  }
}
