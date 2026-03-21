import { Controller, Get, Query, Param, UseGuards, Req } from "@nestjs/common";
import { AnalysisService } from "./analysis.service";
import { AnalysisQueryDto } from "./dto/analysis-query.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { validateOrganizationAccess } from "../../common/utils/access-control.util";

@Controller("analysis")
@UseGuards(JwtAuthGuard)
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Get("incidence-rates")
  // async getIncidenceRates(@Query() query: AnalysisQueryDto) { // ESKI
  //   return this.analysisService.getIncidenceRates(query); // ESKI
  // } // ESKI
  async getIncidenceRates(@Query() query: AnalysisQueryDto, @Req() req: any) {
    if (query.organizationId) {
      query.organizationId = validateOrganizationAccess(
        req.user,
        query.organizationId,
      );
    }
    return this.analysisService.getIncidenceRates(query, req.user);
  }

  @Get("global-summary")
  // async getGlobalSummary( // ESKI
  //   @Query("startDate") startDate: string, // ESKI
  //   @Query("endDate") endDate: string, // ESKI
  // ) { // ESKI
  //   return this.analysisService.getGlobalSummary(startDate, endDate); // ESKI
  // } // ESKI
  async getGlobalSummary(
    @Query("startDate") startDate: string,
    @Query("endDate") endDate: string,
    @Req() req: any,
  ) {
    return this.analysisService.getGlobalSummary(startDate, endDate, req.user);
  }

  @Get("seed")
  async seed() {
    return this.analysisService.seedPopulation();
  }

  @Get("forecast")
  // async getForecast(@Query("diseaseType") diseaseType: string) { // ESKI
  //   return this.analysisService.getForecast(diseaseType); // ESKI
  // } // ESKI
  async getForecast(
    @Query("diseaseType") diseaseType: string,
    @Req() req: any,
  ) {
    // UZ: Tanlangan kasallik turi bo'yicha bashorat olish
    return this.analysisService.getForecast(diseaseType, req.user);
  }

  @Get("forecasts/ranked")
  // async getAllForecastsRanked() { // ESKI
  //   return this.analysisService.getAllForecastsRanked(); // ESKI
  // } // ESKI
  async getAllForecastsRanked(@Req() req: any) {
    // UZ: Barcha kasalliklar uchun xavf darajasi bo'yicha tartiblangan prognoz
    return this.analysisService.getAllForecastsRanked(req.user);
  }

  @Get("executive/summary")
  // async getExecutiveSummary() { // ESKI
  //   return this.analysisService.getExecutiveData(); // ESKI
  // } // ESKI
  async getExecutiveSummary(@Req() req: any) {
    // UZ: Rahbar uchun maxsus "Svodka" ma'lumotlari
    return this.analysisService.getExecutiveData(req.user);
  }

  @Get("executive/district-summary/:id")
  // async getDistrictExecutiveSummary(@Param("id") id: string) { // ESKI
  //   return this.analysisService.getDistrictExecutiveSummary(id); // ESKI
  // } // ESKI
  async getDistrictExecutiveSummary(@Param("id") id: string, @Req() req: any) {
    const validatedId = validateOrganizationAccess(req.user, id);
    return this.analysisService.getDistrictExecutiveSummary(
      validatedId,
      req.user,
    );
  }

  @Get("executive/district/:id")
  // async getDistrictExecutiveDetails(@Param("id") id: string) { // ESKI
  //   return this.analysisService.getDistrictExecutiveDetails(id); // ESKI
  // } // ESKI
  async getDistrictExecutiveDetails(@Param("id") id: string, @Req() req: any) {
    const validatedId = validateOrganizationAccess(req.user, id);
    return this.analysisService.getDistrictExecutiveDetails(
      validatedId,
      req.user,
    );
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * @Controller("analysis")
 * export class AnalysisController {
 *   constructor(private readonly analysisService: AnalysisService) {}
 *
 *   @Get("incidence-rates")
 *   async getIncidenceRates(@Query() query: AnalysisQueryDto) {
 *     return this.analysisService.getIncidenceRates(query);
 *   }
 *
 *   @Get("global-summary")
 *   async getGlobalSummary(
 *     @Query("startDate") startDate: string,
 *     @Query("endDate") endDate: string,
 *   ) {
 *     return this.analysisService.getGlobalSummary(startDate, endDate);
 *   }
 *
 *   @Get("seed")
 *   async seed() {
 *     return this.analysisService.seedPopulation();
 *   }
 *
 *   @Get("forecast")
 *   async getForecast(@Query("diseaseType") diseaseType: string) {
 *     // UZ: Tanlangan kasallik turi bo'yicha bashorat olish
 *     return this.analysisService.getForecast(diseaseType);
 *   }
 *
 *   @Get("forecasts/ranked")
 *   async getAllForecastsRanked() {
 *     // UZ: Barcha kasalliklar uchun xavf darajasi bo'yicha tartiblangan prognoz
 *     return this.analysisService.getAllForecastsRanked();
 *   }
 *
 *   @Get("executive/summary")
 *   async getExecutiveSummary() {
 *     // UZ: Rahbar uchun maxsus "Svodka" ma'lumotlari
 *     return this.analysisService.getExecutiveData();
 *   }
 *
 *   @Get("executive/district-summary/:id")
 *   async getDistrictExecutiveSummary(@Param("id") id: string) {
 *     // UZ: Tuman rahbari uchun (Executive Dashboard o'xshash)
 *     return this.analysisService.getDistrictExecutiveSummary(id);
 *   }
 *
 *   @Get("executive/district/:id")
 *   async getDistrictExecutiveDetails(@Param("id") id: string) {
 *     // UZ: Tuman bo'yicha batafsil (Top kasalliklar)
 *     return this.analysisService.getDistrictExecutiveDetails(id);
 *   }
 * }
 */
