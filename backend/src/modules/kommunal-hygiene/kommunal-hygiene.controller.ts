import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { KommunalHygieneService } from './kommunal-hygiene.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('kommunal-hygiene')
@UseGuards(JwtAuthGuard)
export class KommunalHygieneController {
    constructor(private readonly service: KommunalHygieneService) { }

    @Get('water')
    findByMonth(
        @Query('month') month: string,
        @Query('orgId') orgId?: string,
    ) {
        return this.service.findByMonthAndOrg(month, orgId);
    }

    @Post('water')
    upsertRow(@Body() dto: any) {
        return this.service.upsertRow(dto);
    }

    @Get('open-water')
    findOpenWater(
        @Query('month') month: string,
        @Query('orgId') orgId?: string,
    ) {
        return this.service.findOpenWater(month, orgId);
    }

    @Post('open-water')
    saveOpenWater(@Body() body: { rows: any[], month: string, organizationId: string }) {
        return this.service.saveOpenWaterRows(body.rows, body.month, body.organizationId);
    }

    @Get('water-usage')
    findWaterUsage(
        @Query('month') month: string,
        @Query('orgId') orgId?: string,
    ) {
        return this.service.findWaterUsage(month, orgId);
    }

    @Post('water-usage')
    saveWaterUsage(@Body() body: { rows: any[], month: string, organizationId: string }) {
        return this.service.saveWaterUsageRows(body.rows, body.month, body.organizationId);
    }

    @Get('regional-status')
    getRegionalStatus(@Query('month') month: string) {
        return this.service.getRegionalStatus(month);
    }
}
