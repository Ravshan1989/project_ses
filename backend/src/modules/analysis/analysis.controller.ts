import { Controller, Get, Query } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { AnalysisQueryDto } from './dto/analysis-query.dto';

@Controller('analysis')
export class AnalysisController {
    constructor(private readonly analysisService: AnalysisService) { }

    @Get('incidence-rates')
    async getIncidenceRates(@Query() query: AnalysisQueryDto) {
        return this.analysisService.getIncidenceRates(query);
    }

    @Get('global-summary')
    async getGlobalSummary(@Query('startDate') startDate: string, @Query('endDate') endDate: string) {
        return this.analysisService.getGlobalSummary(startDate, endDate);
    }

    @Get('seed')
    async seed() {
        return this.analysisService.seedPopulation();
    }
}
