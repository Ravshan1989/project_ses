import {
    Controller, Get, Post, Patch, Delete,
    Body, Query, Param, UseGuards
} from "@nestjs/common";
import { InspectionsService } from "./inspections.service";
import { CreateInspectionRecordDto } from "./dto/create-inspection-record.dto";
import { UpdateInspectionRecordDto } from "./dto/update-inspection-record.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("inspections")
@UseGuards(JwtAuthGuard)
export class InspectionsController {
    constructor(private readonly inspectionsService: InspectionsService) { }

    // ===== 1-жадвал =====
    @Get("records")
    getRecords(@Query("month") month: string, @Query("organizationId") organizationId: string) {
        return this.inspectionsService.getRecords(month, organizationId);
    }

    @Post("records")
    createRecord(@Body() dto: CreateInspectionRecordDto) {
        return this.inspectionsService.createRecord(dto);
    }

    @Patch("records/:id")
    updateRecord(@Param("id") id: string, @Body() dto: UpdateInspectionRecordDto) {
        return this.inspectionsService.updateRecord(id, dto);
    }

    @Delete("records/:id")
    deleteRecord(@Param("id") id: string) {
        return this.inspectionsService.deleteRecord(id);
    }

    // ===== 2-жадвал =====
    @Get("table2")
    getTable2(@Query("month") month: string, @Query("organizationId") organizationId: string) {
        return this.inspectionsService.getTable2Data(month, organizationId);
    }

    @Post("table2")
    saveTable2(@Body() body: { month: string; organizationId: string; rows: any[] }) {
        return this.inspectionsService.saveTable2Data(body.month, body.organizationId, body.rows);
    }

    // ===== 3-жадвал =====
    @Get("table3")
    getTable3(@Query("month") month: string, @Query("organizationId") organizationId: string) {
        return this.inspectionsService.getTable3Data(month, organizationId);
    }

    @Post("table3")
    saveTable3(@Body() body: { month: string; organizationId: string; rows: any[] }) {
        return this.inspectionsService.saveTable3Data(body.month, body.organizationId, body.rows);
    }
    // ===== 4-жадвал =====
    @Get("table4")
    getTable4(@Query("month") month: string, @Query("organizationId") organizationId: string) {
        return this.inspectionsService.getTable4Data(month, organizationId);
    }

    @Post("table4")
    saveTable4(@Body() body: { month: string; organizationId: string; rows: any[] }) {
        return this.inspectionsService.saveTable4Data(body.month, body.organizationId, body.rows);
    }
}
