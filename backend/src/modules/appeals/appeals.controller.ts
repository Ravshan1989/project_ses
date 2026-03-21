import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  Param,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { AppealsService } from "./appeals.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateAppealRecordDto } from "./dto/create-appeal-record.dto";
import { AppealsImportService } from "./appeals-import.service";
import { Response } from "express";
import { validateOrganizationAccess } from "../../common/utils/access-control.util";

@Controller("appeals")
@UseGuards(JwtAuthGuard)
export class AppealsController {
  constructor(
    private readonly appealsService: AppealsService,
    private readonly importService: AppealsImportService,
  ) {}

  // async getTable( // ESKI
  //   @Query("tableNum") tableNum: string, // ESKI
  //   @Query("month") month: string, // ESKI
  //   @Query("organizationId") organizationId: string, // ESKI
  // ) { // ESKI
  @Get("table")
  async getTable(
    @Query("tableNum") tableNum: string,
    @Query("month") month: string,
    @Query("organizationId") organizationId: string,
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    const num = parseInt(tableNum);
    if (isNaN(num)) return [];

    return this.appealsService.getTableData(num, month, validatedOrgId);
  }

  // async saveTable( // ESKI
  //   @Body() // ESKI
  //   body: { // ESKI
  //     tableNum: number; // ESKI
  //     month: string; // ESKI
  //     organizationId: string; // ESKI
  //     rows: any[]; // ESKI
  //   }, // ESKI
  // ) { // ESKI
  @Post("table")
  async saveTable(
    @Body()
    body: {
      tableNum: number;
      month: string;
      organizationId: string;
      rows: any[];
    },
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(
      req.user,
      body.organizationId,
    );
    return this.appealsService.saveTableData(
      body.tableNum,
      body.month,
      validatedOrgId,
      body.rows,
    );
  }

  // --- NEW SINGLE ENTRY SYSTEM ---

  @Post("records")
  async createRecord(@Body() dto: CreateAppealRecordDto, @Req() req: any) {
    return this.appealsService.createRecord(dto, req.user.id);
  }

  @Get("records")
  async getRecords(
    @Query("organizationId") organizationId: string,
    @Query("month") month: string,
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    return this.appealsService.getRecords(validatedOrgId, month);
  }

  @Post("records/:id/close")
  async closeRecord(
    @Param("id") id: string,
    @Body() body: { status: any; closureDate: string; consequence?: any },
  ) {
    return this.appealsService.closeRecord(
      id,
      body.status,
      body.closureDate,
      body.consequence,
    );
  }

  @Post("records/:id/extend")
  async extendRecord(
    @Param("id") id: string,
    @Body() body: { newDeadline: string; reason: string },
  ) {
    return this.appealsService.extendDeadline(
      id,
      body.newDeadline,
      body.reason,
    );
  }

  @Post("records/:id/update") // Use POST for update for simplicity with DTOs in some proxies, or PATCH
  async updateRecord(
    @Param("id") id: string,
    @Body() dto: Partial<CreateAppealRecordDto>,
  ) {
    return this.appealsService.updateRecord(id, dto);
  }

  @Post("records/:id/delete")
  async deleteRecord(@Param("id") id: string) {
    return this.appealsService.deleteRecord(id);
  }

  @Get("auto-reports")
  async getAutoReports(
    @Query("organizationId") organizationId: string,
    @Query("month") month: string,
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    return this.appealsService.generateReportsFromRecords(
      validatedOrgId,
      month,
    );
  }

  @Get("monitoring")
  async getMonitoring(
    @Query("organizationId") organizationId: string,
    @Query("month") month: string,
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    return this.appealsService.getMonitoringData(validatedOrgId, month);
  }

  @Get("export-excel")
  async exportExcel(
    @Query("organizationId") organizationId: string,
    @Query("month") month: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    return this.appealsService.exportExcel(res, validatedOrgId, month);
  }

  @Get("export-pdf")
  async exportPdf(
    @Query("organizationId") organizationId: string,
    @Query("month") month: string,
    @Req() req: any,
    @Res() res: Response,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, organizationId);
    return this.appealsService.exportPdf(res, validatedOrgId, month);
  }

  @Post("aggregate")
  async aggregateData(
    @Body() body: { organizationId: string; month: string },
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(
      req.user,
      body.organizationId,
    );
    return this.importService.aggregateDistricts(validatedOrgId, body.month);
  }

  @Post("import-bulk")
  @UseInterceptors(
    FilesInterceptor("files", 100, {
      limits: {
        fileSize: 100 * 1024 * 1024, // 100MB per file
        fieldSize: 100 * 1024 * 1024,
      },
    }),
  )
  async importBulk(
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Query("month") month: string,
    @Query("parentId") parentId: string,
    @Req() req: any,
  ) {
    const validatedOrgId = validateOrganizationAccess(req.user, parentId);
    console.log(
      `[BULK DEBUG] Starting import-bulk for ${files?.length} files, month: ${month}, validatedOrgId: ${validatedOrgId}`,
    );
    try {
      const result = await this.importService.importBulk(
        files,
        month,
        validatedOrgId,
      );
      console.log(`[BULK DEBUG] Import-bulk finished successfully`);
      return result;
    } catch (error) {
      console.error(`[BULK ERROR] Error in importBulk:`, error.message);
      console.error(error.stack);
      throw error;
    }
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * @Controller("appeals")
 * @UseGuards(JwtAuthGuard)
 * export class AppealsController {
 *   constructor(
 *     private readonly appealsService: AppealsService,
 *     private readonly importService: AppealsImportService
 *   ) {}
 *
 *   @Get("table")
 *   async getTable(
 *     @Query("tableNum") tableNum: string,
 *     @Query("month") month: string,
 *     @Query("organizationId") organizationId: string,
 *   ) {
 *     const num = parseInt(tableNum);
 *     if (isNaN(num)) return [];
 *     return this.appealsService.getTableData(num, month, organizationId);
 *   }
 * }
 */
