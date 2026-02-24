import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { AppealsService } from "./appeals.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

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
}
