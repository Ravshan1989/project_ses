import { Controller, Get, Post, Body, Query, UseGuards } from "@nestjs/common";
import { NutritionHygieneService } from "./nutrition-hygiene.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { RequirePermission } from "../../common/decorators/permissions.decorator";

@Controller("nutrition-hygiene")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class NutritionHygieneController {
    constructor(private readonly nutritionHygieneService: NutritionHygieneService) { }

    @Get("table")
    @RequirePermission("VIEW_NUTRITION_HYGIENE")
    async getTableData(
        @Query("tableNum") tableNum: string,
        @Query("month") month: string,
        @Query("organizationId") organizationId: string,
    ) {
        return await this.nutritionHygieneService.getTableData(parseInt(tableNum), month, organizationId);
    }

    @Post("table")
    @RequirePermission("EDIT_NUTRITION_HYGIENE")
    async saveTableData(
        @Query("tableNum") tableNum: string,
        @Query("month") month: string,
        @Query("organizationId") organizationId: string,
        @Body() rows: any[],
    ) {
        return await this.nutritionHygieneService.saveTableData(parseInt(tableNum), month, organizationId, rows);
    }
}
