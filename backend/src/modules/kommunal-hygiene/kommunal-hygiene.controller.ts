import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Res,
} from "@nestjs/common";
import { Response } from "express";
import { KommunalHygieneService } from "./kommunal-hygiene.service";
import { KommunalHygieneExportService } from "./kommunal-hygiene-export.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("kommunal-hygiene")
@UseGuards(JwtAuthGuard)
export class KommunalHygieneController {
  constructor(
    private readonly service: KommunalHygieneService,
    private readonly exportService: KommunalHygieneExportService,
  ) {}

  @Get("water")
  findByMonth(@Query("month") month: string, @Query("orgId") orgId?: string) {
    return this.service.findByMonthAndOrg(month, orgId);
  }

  @Post("water")
  upsertRow(@Body() dto: any) {
    return this.service.upsertRow(dto);
  }

  @Get("open-water")
  findOpenWater(@Query("month") month: string, @Query("orgId") orgId?: string) {
    return this.service.findOpenWater(month, orgId);
  }

  @Post("open-water")
  saveOpenWater(
    @Body() body: { rows: any[]; month: string; organizationId: string },
  ) {
    return this.service.saveOpenWaterRows(
      body.rows,
      body.month,
      body.organizationId,
    );
  }

  @Get("water-usage")
  findWaterUsage(
    @Query("month") month: string,
    @Query("orgId") orgId?: string,
  ) {
    return this.service.findWaterUsage(month, orgId);
  }

  @Post("water-usage")
  saveWaterUsage(
    @Body() body: { rows: any[]; month: string; organizationId: string },
  ) {
    return this.service.saveWaterUsageRows(
      body.rows,
      body.month,
      body.organizationId,
    );
  }

  @Get("regional-status")
  getRegionalStatus(@Query("month") month: string) {
    return this.service.getRegionalStatus(month);
  }

  @Get("export-excel")
  async exportExcel(
    @Query("month") month: string,
    @Query("orgId") orgId: string,
    @Res() res: Response,
  ) {
    return this.exportService.exportRegional(month, orgId, res);
  }
}
