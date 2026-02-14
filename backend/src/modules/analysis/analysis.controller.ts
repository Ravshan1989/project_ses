import { Controller, Get, Query, Param } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalysisQueryDto } from "./dto/analysis-query.dto";

@Controller("analysis")
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) { }

  @Get("incidence-rates")
  async getIncidenceRates(@Query() query: AnalysisQueryDto) {
    return this.analysisService.getIncidenceRates(query);
  }

  @Get("global-summary")
  async getGlobalSummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
  ) {
    return this.analysisService.getGlobalSummary(startDate, endDate);
  }

  @Get("seed")
  async seed() {
    return this.analysisService.seedPopulation();
  }

  @Get("forecast")
  async getForecast(@Query("diseaseType") diseaseType: string) {
    // UZ: Tanlangan kasallik turi bo'yicha bashorat olish
    return this.analysisService.getForecast(diseaseType);
  }

  @Get("forecasts/ranked")
  async getAllForecastsRanked() {
    // UZ: Barcha kasalliklar uchun xavf darajasi bo'yicha tartiblangan prognoz
    return this.analysisService.getAllForecastsRanked();
  }

  @Get("executive/summary")
  async getExecutiveSummary() {
    // UZ: Rahbar uchun maxsus "Svodka" ma'lumotlari
    return this.analysisService.getExecutiveData();
  }

  @Get("executive/district/:id")
  async getDistrictExecutiveDetails(@Param("id") id: string) {
    // UZ: Tuman bo'yicha batafsil (Top kasalliklar)
    return this.analysisService.getDistrictExecutiveDetails(id);
  }
}
