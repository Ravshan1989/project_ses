import { Controller, Get, Post, Body, Query, UseGuards, Req } from "@nestjs/common";
import { AppealsService } from "./appeals.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CreateAppealRecordDto } from "./dto/create-appeal-record.dto";

@Controller("appeals")
@UseGuards(JwtAuthGuard)
export class AppealsController {
    constructor(private readonly appealsService: AppealsService) { }

    @Get("table")
    async getTable(
        @Query("tableNum") tableNum: string,
        @Query("month") month: string,
        @Query("organizationId") organizationId: string,
    ) {
        return this.appealsService.getTableData(parseInt(tableNum), month, organizationId);
    }

    @Post("table")
    async saveTable(
        @Body() body: { tableNum: number; month: string; organizationId: string; rows: any[] },
    ) {
        return this.appealsService.saveTableData(body.tableNum, body.month, body.organizationId, body.rows);
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
    ) {
        return this.appealsService.getRecords(organizationId, month);
    }

    @Get("auto-reports")
    async getAutoReports(
        @Query("organizationId") organizationId: string,
        @Query("month") month: string,
    ) {
        return this.appealsService.generateReportsFromRecords(organizationId, month);
    }
}
