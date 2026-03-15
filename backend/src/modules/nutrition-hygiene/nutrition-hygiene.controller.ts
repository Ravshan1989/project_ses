import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from "@nestjs/common";
import { NutritionHygieneService } from "./nutrition-hygiene.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { CreateNutritionRecordDto } from "./dto/create-nutrition-record.dto";

@Controller("nutrition-hygiene")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NutritionHygieneController {
  constructor(
    private readonly nutritionHygieneService: NutritionHygieneService,
  ) {}

  @Get("records")
  @RequirePermission("VIEW_NUTRITION_HYGIENE")
  async getRecords(
    @Query("month") month: string,
    @Query("organizationId") organizationId: string,
  ) {
    return await this.nutritionHygieneService.getRecords(organizationId, month);
  }

  @Post("records")
  @RequirePermission("EDIT_NUTRITION_HYGIENE")
  async createRecord(@Body() dto: CreateNutritionRecordDto, @Req() req: any) {
    return await this.nutritionHygieneService.createRecord(dto, req.user.id);
  }

  @Get("auto-reports")
  @RequirePermission("VIEW_NUTRITION_HYGIENE")
  async getAutoReports(
    @Query("month") month: string,
    @Query("organizationId") organizationId: string,
  ) {
    return await this.nutritionHygieneService.generateReportsFromRecords(
      organizationId,
      month,
    );
  }

  @Get("table")
  @RequirePermission("VIEW_NUTRITION_HYGIENE")
  async getTableData(
    @Query("tableNum") tableNum: string,
    @Query("month") month: string,
    @Query("organizationId") organizationId: string,
  ) {
    return await this.nutritionHygieneService.getTableData(
      parseInt(tableNum),
      month,
      organizationId,
    );
  }

  @Post("table")
  @RequirePermission("EDIT_NUTRITION_HYGIENE")
  async saveTableData(
    @Query("tableNum") tableNum: string,
    @Query("month") month: string,
    @Query("organizationId") organizationId: string,
    @Body() rows: any[],
  ) {
    return await this.nutritionHygieneService.saveTableData(
      parseInt(tableNum),
      month,
      organizationId,
      rows,
    );
  }

  @Get("monitoring")
  @RequirePermission("VIEW_NUTRITION_HYGIENE")
  async getMonitoring(@Query("month") month: string) {
    return await this.nutritionHygieneService.getMonitoringData(month);
  }
}
