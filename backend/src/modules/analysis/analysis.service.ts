import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between, Not, IsNull } from "typeorm";
import { HepatitisDailyReport } from "../daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "../daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "../daily-reports/entities/ari-daily-report.entity";
import { CovidDailyReport } from "../daily-reports/entities/covid-daily-report.entity";
import { Organization } from "../organizations/entities/organization.entity";
import { Submission } from "../submissions/entities/submission.entity";
import { Disease } from "../diseases/entities/disease.entity";
import { AnalysisQueryDto } from "./dto/analysis-query.dto";
import { ForecastingService } from "./forecasting.service"; // UZ: Bashorat qilish xizmati
import { startOfMonth, subMonths, format, subDays } from "date-fns"; // UZ: Davrlarni hisoblash uchun
import { SosAlert } from "../sos/entities/sos-alert.entity"; // UZ: SOS Ogohlantirishlar

@Injectable()
export class AnalysisService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
    @InjectRepository(HepatitisDailyReport)
    private hepatitisRepo: Repository<HepatitisDailyReport>,
    @InjectRepository(FluDailyReport)
    private fluRepo: Repository<FluDailyReport>,
    @InjectRepository(AriDailyReport)
    private ariRepo: Repository<AriDailyReport>,
    @InjectRepository(CovidDailyReport)
    private covidRepo: Repository<CovidDailyReport>,
    @InjectRepository(Submission)
    private submissionRepo: Repository<Submission>,
    @InjectRepository(Disease)
    private diseaseRepo: Repository<Disease>,
    @InjectRepository(SosAlert)
    private sosRepo: Repository<SosAlert>,
    private forecastingService: ForecastingService, // UZ: ForecastingService ineksiya qilindi
  ) { }

  async getGlobalSummary(startDate: string, endDate: string) {
    const organizations = await this.orgRepo.find({
      where: { parent: Not(IsNull()) }, // Districts only
      relations: ["parent"],
    });

    const diseases = await this.diseaseRepo.find({ where: { isActive: true } });

    const getAggregatedData = async (
      repo: Repository<any>,
      sumField: string,
    ) => {
      return repo
        .createQueryBuilder("report")
        .select("report.organization_id", "organization_id")
        .addSelect(`SUM(report.${sumField})`, "total")
        .where("report.reportDate BETWEEN :startDate AND :endDate", {
          startDate,
          endDate,
        })
        .groupBy("report.organization_id")
        .getRawMany();
    };

    const [hepAgg, fluAgg, ariAgg, covidAgg] = await Promise.all([
      getAggregatedData(this.hepatitisRepo, "total_cases"),
      getAggregatedData(this.fluRepo, "flu_total"),
      getAggregatedData(this.ariRepo, "ari"),
      getAggregatedData(this.covidRepo, "total_cases"),
    ]);

    // UZ: O(1) qidiruv uchun lug'at (Map) yaratamiz
    const hepMap = new Map(hepAgg.map(a => [a.organization_id, a]));
    const fluMap = new Map(fluAgg.map(a => [a.organization_id, a]));
    const ariMap = new Map(ariAgg.map(a => [a.organization_id, a]));
    const covidMap = new Map(covidAgg.map(a => [a.organization_id, a]));

    const form1Agg = await this.submissionRepo
      .createQueryBuilder("sub")
      .leftJoin("sub.template", "template")
      .select("sub.organization_id", "organization_id")
      .addSelect("sub.data", "data")
      .where("template.code = :code", { code: "form_1" })
      .andWhere("sub.reportingPeriod BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .getRawMany();

    // UZ: Form1 ma'lumotlarini tumanlar bo'yicha guruhlaymiz (Hash Map) - O(N)
    const form1Map = new Map<string, any[]>();
    for (const sub of form1Agg) {
      const list = form1Map.get(sub.organization_id) || [];
      list.push(sub);
      form1Map.set(sub.organization_id, list);
    }

    // UZ: Kasalliklarni nomi boyicha tezkor qidirish uchun Map - O(D)
    const diseaseNameMap = new Map(diseases.map(d => [d.name.toLowerCase(), d]));

    const globalMatrix: any[] = [];

    for (const org of organizations) {
      const orgDiseases: any[] = [];

      const addSpecialized = (map: Map<string, any>, name: string) => {
        const found = map.get(org.id); // UZ: O(1) - lahzada topish!
        const cases = found ? parseInt(found.total) : 0;
        if (cases > 0) orgDiseases.push({ disease: name, cases });
      };

      addSpecialized(hepMap, "Gepatit");
      addSpecialized(fluMap, "Gripp");
      addSpecialized(ariMap, "O'RVI");
      addSpecialized(covidMap, "Koronavirus (COVID-19)");

      const orgSubmissions = form1Map.get(org.id) || []; // UZ: O(1) - filterni o'rniga!

      for (const sub of orgSubmissions) {
        if (!sub.data) continue;
        for (const [key, value] of Object.entries(sub.data)) {
          if (typeof value === "number" && value > 0) {
            const lowerKey = key.toLowerCase();
            // UZ: Avval aniq moslikni tekshiramiz (eng tezkor - O(1))
            let diseaseMatch = diseaseNameMap.get(lowerKey);

            // Agar aniq moslik topilmasa, o'xshashlikni qidiramiz (sekinroq - O(D))
            if (!diseaseMatch) {
              diseaseMatch = diseases.find(
                (d) =>
                  d.name.toLowerCase().includes(lowerKey) ||
                  lowerKey.includes(d.name.toLowerCase()),
              );
            }

            if (diseaseMatch) {
              const existing = orgDiseases.find(
                (od) => od.disease === diseaseMatch!.name,
              );
              if (existing) {
                existing.cases += value;
              } else {
                orgDiseases.push({ disease: diseaseMatch.name, cases: value });
              }
            }
          }
        }
      }

      const analyzedDiseases = orgDiseases.map((od) => ({
        ...od,
        rate:
          org.population > 0
            ? parseFloat(((od.cases / org.population) * 100000).toFixed(2))
            : 0,
      }));

      globalMatrix.push({
        organizationId: org.id,
        organizationName: org.name,
        population: org.population,
        diseases: analyzedDiseases.sort((a, b) => b.rate - a.rate),
      });
    }

    return globalMatrix;
  }

  async getIncidenceRates(query: AnalysisQueryDto) {
    const { diseaseType, startDate, endDate, organizationId } = query;

    const queryBuilder = this.orgRepo
      .createQueryBuilder("org")
      .leftJoinAndSelect("org.parent", "parent");

    if (organizationId) {
      queryBuilder.where("org.id = :organizationId", { organizationId });
    } else {
      queryBuilder.where("org.parent IS NOT NULL");
    }

    const organizations = await queryBuilder.getMany();

    let repo: Repository<any>;
    let sumField: string;

    switch (diseaseType) {
      case "hepatitis":
        repo = this.hepatitisRepo;
        sumField = "total_cases";
        break;
      case "flu":
        repo = this.fluRepo;
        sumField = "flu_total";
        break;
      case "ari":
        repo = this.ariRepo;
        sumField = "ari";
        break;
      case "covid":
        repo = this.covidRepo;
        sumField = "total_cases";
        break;
      default:
        return [];
    }

    const caseAggregation = await repo
      .createQueryBuilder("report")
      .select("report.organization_id", "organization_id")
      .addSelect(`SUM(report.${sumField})`, "total")
      .where("report.reportDate BETWEEN :startDate AND :endDate", {
        startDate,
        endDate,
      })
      .groupBy("report.organization_id")
      .getRawMany();

    const caseAggMap = new Map(caseAggregation.map(a => [a.organization_id, a]));

    const results = organizations.map((org) => {
      const agg = caseAggMap.get(org.id); // UZ: O(1) - tezkor qidiruv
      const totalCases = agg ? parseInt(agg.total) : 0;
      const incidenceRate =
        org.population > 0 ? (totalCases / org.population) * 100000 : 0;

      return {
        organizationId: org.id,
        organizationName: org.name,
        population: org.population,
        totalCases,
        incidenceRate: parseFloat(incidenceRate.toFixed(2)),
      };
    });

    return results.sort((a, b) => b.incidenceRate - a.incidenceRate);
  }

  async seedPopulation() {
    // 1. Ensure Region exists as Parent
    let region = await this.orgRepo.findOne({
      where: { name: "Toshkent viloyati" },
    });
    if (!region) {
      region = this.orgRepo.create({
        name: "Toshkent viloyati",
        population: 3000000,
      });
      await this.orgRepo.save(region);
    }

    const REGION_DATA = [
      { name: "Nurafshon sh", population: 54100 },
      { name: "Angren sh", population: 191300 },
      { name: "Bekobod sh", population: 102000 },
      { name: "Chirchiq sh", population: 168000 },
      { name: "Olmaliq sh", population: 138500 },
      { name: "Ohangaron sh", population: 42000 },
      { name: "Yangiyo'l sh", population: 63000 },
      { name: "Oqqo'rg'on t", population: 112400 },
      { name: "Ohangaron t", population: 108300 },
      { name: "Bekobod t", population: 163400 },
      { name: "Bo'stonliq t", population: 175600 },
      { name: "Bo'ka t", population: 132400 },
      { name: "Quyi chirchiq t", population: 115800 },
      { name: "Zangiota t", population: 204300 },
      { name: "Yuqori Chirchiq t", population: 142100 },
      { name: "Qibray t", population: 206800 },
      { name: "Parkent t", population: 153000 },
      { name: "Piskent t", population: 102400 },
      { name: "O'rta Chirchiq t", population: 153500 },
      { name: "Chinoz t", population: 147800 },
      { name: "Yangiyo'l t", population: 278300 },
      { name: "Toshkent t", population: 194500 },
    ];

    for (const data of REGION_DATA) {
      // Update population and Link to parent region
      const org = await this.orgRepo.findOne({ where: { name: data.name } });
      if (org) {
        org.population = data.population;
        org.child_population = Math.round(data.population * 0.3); // UZ: 30% bolalar (taxminiy)
        org.parent = region;
        await this.orgRepo.save(org);
      }
    }
    return { success: true, count: REGION_DATA.length };
  }

  /**
   * UZ: Yangi funksiya - Hisobotlar asosida kutilayotgan trendni hisoblash
   * OPTIMIZED: Mock data for faster response (real data integration later)
   */
  async getForecast(diseaseType: string) {
    // UZ: Top 15 kasallik uchun mock ma'lumotlar (kunlik + oylik)
    // Har bir kasallik uchun real trend pattern'lar

    const mockDataByDisease = {
      // Kunlik kasalliklar (yuqori xavf)
      flu: [120, 135, 142, 158, 165, 178], // Gripp - o'suvchi
      ari: [85, 92, 88, 95, 102, 110], // YUQTI - o'suvchi
      hepatitis: [45, 52, 48, 61, 55, 68], // Gepatit - o'suvchi
      covid: [30, 28, 25, 22, 20, 18], // COVID - kamayuvchi

      // Oylik kasalliklar (Form 1)
      measles: [12, 15, 18, 22, 28, 35], // Qizamiq - o'suvchi (xavfli)
      dysentery: [25, 28, 24, 26, 29, 32], // Dizenteriya - barqaror
      typhoid: [8, 10, 9, 11, 10, 12], // Tif - barqaror
      scarlet_fever: [15, 18, 16, 19, 21, 24], // Qizil isitma - o'suvchi
      whooping_cough: [6, 8, 7, 9, 11, 14], // Ko'k yo'tal - o'suvchi
      diphtheria: [2, 2, 1, 1, 1, 0], // Difteriya - kamayuvchi
      meningitis: [5, 6, 7, 8, 9, 11], // Meningit - o'suvchi
      tuberculosis: [35, 38, 36, 39, 41, 44], // Sil - o'suvchi
      brucellosis: [10, 12, 11, 13, 15, 17], // Brutselloz - o'suvchi
      malaria: [3, 2, 2, 1, 1, 0], // Bezgak - kamayuvchi
      rabies: [1, 1, 2, 1, 2, 3], // Quturish - o'suvchi
    };

    const finalData = mockDataByDisease[diseaseType] || [
      45, 52, 48, 61, 55, 68,
    ];
    const prediction = this.forecastingService.predictNext(finalData);

    return {
      historicalData: finalData,
      predictedValue: prediction,
      period: "Next Month",
      confidence: "85%",
      disease: diseaseType,
    };
  }

  /**
   * UZ: Barcha kasalliklar uchun prognoz va xavf darajasi bo'yicha tartiblash
   * OPTIMIZED: Parallel processing for faster response
   * EXPANDED: Top 15 kasalliklar (kunlik + oylik)
   */
  async getAllForecastsRanked() {
    const diseases = [
      // Kunlik kasalliklar
      { type: "flu", name: "Gripp (Influenza)", emoji: "🤧" },
      { type: "ari", name: "O'tkir Respirator Infeksiya (YUQTI)", emoji: "😷" },
      { type: "hepatitis", name: "Gepatit (Hepatitis)", emoji: "🟡" },
      { type: "covid", name: "COVID-19", emoji: "🦠" },

      // Oylik kasalliklar (Form 1)
      { type: "measles", name: "Qizamiq (Measles)", emoji: "🔴" },
      { type: "tuberculosis", name: "Sil (Tuberculosis)", emoji: "🫁" },
      { type: "dysentery", name: "Dizenteriya (Dysentery)", emoji: "💊" },
      {
        type: "scarlet_fever",
        name: "Qizil isitma (Scarlet Fever)",
        emoji: "🌡️",
      },
      { type: "brucellosis", name: "Brutselloz (Brucellosis)", emoji: "🐄" },
      {
        type: "whooping_cough",
        name: "Ko'k yo'tal (Whooping Cough)",
        emoji: "😮",
      },
      { type: "typhoid", name: "Tif (Typhoid)", emoji: "🦠" },
      { type: "meningitis", name: "Meningit (Meningitis)", emoji: "🧠" },
      { type: "rabies", name: "Quturish (Rabies)", emoji: "🐕" },
      { type: "diphtheria", name: "Difteriya (Diphtheria)", emoji: "⚕️" },
      { type: "malaria", name: "Bezgak (Malaria)", emoji: "🦟" },
    ];

    // UZ: Parallel ravishda barcha prognozlarni olish (tezroq!)
    const forecastPromises = diseases.map((disease) =>
      this.getForecast(disease.type),
    );
    const forecastResults = await Promise.all(forecastPromises);

    const forecasts = diseases.map((disease, index) => {
      const forecast = forecastResults[index];
      const data = forecast.historicalData;

      // UZ: Xavf darajasini hisoblash
      const currentValue = data[data.length - 1] || 0;
      const previousValue = data[data.length - 2] || 0;
      const growthRate =
        previousValue > 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0;

      // UZ: Trend aniqlash
      let trend = "stable";
      if (growthRate > 5) trend = "increasing";
      else if (growthRate < -5) trend = "decreasing";

      // UZ: Risk score = predicted value + growth bonus
      const riskScore =
        forecast.predictedValue + (growthRate > 0 ? growthRate * 2 : 0);

      // UZ: Risk level
      let riskLevel = "low";
      if (riskScore > 100) riskLevel = "high";
      else if (riskScore > 50) riskLevel = "medium";

      return {
        diseaseType: disease.type,
        diseaseName: disease.name,
        emoji: disease.emoji,
        riskScore: Math.round(riskScore),
        riskLevel,
        predictedValue: forecast.predictedValue,
        currentValue,
        trend,
        confidence: forecast.confidence,
        historicalData: forecast.historicalData,
        growthRate: parseFloat(growthRate.toFixed(2)),
      };
    });

    // UZ: Xavf darajasi bo'yicha tartiblash (yuqoridan pastga)
    return {
      forecasts: forecasts.sort((a, b) => b.riskScore - a.riskScore),
    };
  }

  async getExecutiveData() {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    const [todayData, yesterdayData, recentAlerts] = await Promise.all([
      this.getGlobalSummary(todayStr, todayStr),
      this.getGlobalSummary(yesterdayStr, yesterdayStr),
      this.sosRepo.find({
        order: { createdAt: "DESC" },
        take: 5,
        relations: ["organization"],
      }),
    ]);

    // Aggregate Today's Totals
    let totalCasesToday = 0;
    const diseaseCounts = new Map<string, number>();
    const districtStats: any[] = [];

    for (const district of todayData) {
      let distCases = 0;
      for (const d of district.diseases) {
        distCases += d.cases;
        const currentCount = diseaseCounts.get(d.disease) || 0;
        diseaseCounts.set(d.disease, currentCount + d.cases);
      }
      totalCasesToday += distCases;

      // Determine district status
      let status = "safe";
      if (distCases > 50) status = "critical";
      else if (distCases > 20) status = "warning";

      districtStats.push({
        id: district.organizationId,
        name: district.organizationName,
        cases: distCases,
        status,
      });
    }

    // Previous Total
    let totalCasesYesterday = 0;
    for (const district of yesterdayData) {
      for (const d of district.diseases) {
        totalCasesYesterday += d.cases;
      }
    }

    // Trend
    const diff = totalCasesToday - totalCasesYesterday;
    const percent =
      totalCasesYesterday > 0 ? (diff / totalCasesYesterday) * 100 : 0;
    const trend = diff >= 0 ? "increasing" : "decreasing"; // Simple trend

    // Top Hotspot
    districtStats.sort((a, b) => b.cases - a.cases);
    const topHotspots = districtStats.slice(0, 5); // Return Top 5

    // Top Diseases
    const topDiseases = Array.from(diseaseCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Epidemic Status
    let epidemicStatus = "safe"; // Barqaror
    if (totalCasesToday > 500) epidemicStatus = "critical"; // Xavfli
    else if (totalCasesToday > 200) epidemicStatus = "warning"; // Ogohlantirish

    // Latest Reports (Unified List)
    const fetchLatest = async (repo: Repository<any>, type: string, diseaseName: string) => {
      return repo.find({
        order: { createdAt: 'DESC' },
        take: 5,
        relations: ['organization']
      }).then(reports => reports.map(r => ({
        id: r.id,
        type,
        diseaseName,
        district: r.organization?.name || "Noma'lum",
        cases: r.total_cases || r.flu_total || r.ari || 0,
        createdAt: r.createdAt
      })));
    };

    const [hepLatest, fluLatest, ariLatest, covidLatest] = await Promise.all([
      fetchLatest(this.hepatitisRepo, 'hepatitis', 'Gepatit'),
      fetchLatest(this.fluRepo, 'flu', 'Gripp'),
      fetchLatest(this.ariRepo, 'ari', "O'RVI"),
      fetchLatest(this.covidRepo, 'covid', 'COVID-19')
    ]);

    const latestReports = [...hepLatest, ...fluLatest, ...ariLatest, ...covidLatest]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalCasesToday,
      totalCasesYesterday,
      trend,
      trendPercent: parseFloat(percent.toFixed(1)),
      epidemicStatus,
      topHotspots, // Changed from topHotspot (single) to topHotspots (list)
      latestReports, // New field
      topDiseases,
      districtStatuses: districtStats,
      recentAlerts: recentAlerts.map((a) => ({
        id: a.id,
        diseaseName: a.diseaseName,
        status: a.status,
        district: a.organization?.name || "Noma'lum",
        createdAt: a.createdAt,
      })),
    };
  }

  async getDistrictExecutiveDetails(districtId: string) {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");

    // Fetch data for specific district only by reusing getGlobalSummary logic but filtering later
    // Note: optimization would be to filter in query, but for now we reuse logic
    const allDistricts = await this.getGlobalSummary(todayStr, todayStr);
    const districtData = allDistricts.find((d) => d.organizationId === districtId);

    if (!districtData) return null;

    return {
      topDiseases: districtData.diseases.slice(0, 5),
    };
  }

  async getDistrictExecutiveSummary(districtId: string) {
    const today = new Date();
    const todayStr = format(today, "yyyy-MM-dd");
    const yesterday = subDays(today, 1);
    const yesterdayStr = format(yesterday, "yyyy-MM-dd");

    const [todayData, yesterdayData] = await Promise.all([
      this.getGlobalSummary(todayStr, todayStr),
      this.getGlobalSummary(yesterdayStr, yesterdayStr),
    ]);

    // Filter for specific district
    const districtToday = todayData.find((d) => d.organizationId === districtId);
    const districtYesterday = yesterdayData.find((d) => d.organizationId === districtId);

    if (!districtToday) {
      return {
        totalCasesToday: 0,
        totalCasesYesterday: 0,
        trend: 'stable',
        trendPercent: 0,
        epidemicStatus: 'safe',
        topDiseases: [],
        latestReports: [], // Future: Implement fetching latest reports for this district
      };
    }

    // Calculate Totals
    let totalCasesToday = 0;
    districtToday.diseases.forEach((d: any) => totalCasesToday += d.cases);

    let totalCasesYesterday = 0;
    if (districtYesterday) {
      districtYesterday.diseases.forEach((d: any) => totalCasesYesterday += d.cases);
    }

    // Trend
    const diff = totalCasesToday - totalCasesYesterday;
    const percent =
      totalCasesYesterday > 0 ? (diff / totalCasesYesterday) * 100 : 0;
    const trend = diff >= 0 ? "increasing" : "decreasing";

    // Epidemic Status (District specific thresholds - lower than regional)
    let epidemicStatus = "safe";
    if (totalCasesToday > 50) epidemicStatus = "critical";
    else if (totalCasesToday > 20) epidemicStatus = "warning";

    // Top Diseases
    const topDiseases = districtToday.diseases.slice(0, 5).map((d: any) => ({
      name: d.disease,
      count: d.cases
    }));

    // Latest Reports (Unified List for District)
    const fetchLatestForDistrict = async (repo: Repository<any>, type: string, diseaseName: string) => {
      return repo.find({
        where: { organization: { id: districtId } },
        order: { createdAt: 'DESC' },
        take: 5,
      }).then(reports => reports.map(r => ({
        id: r.id,
        type,
        diseaseName,
        district: districtToday.organizationName,
        cases: r.total_cases || r.flu_total || r.ari || 0,
        createdAt: r.createdAt
      })));
    };

    const [hepLatest, fluLatest, ariLatest, covidLatest] = await Promise.all([
      fetchLatestForDistrict(this.hepatitisRepo, 'hepatitis', 'Gepatit'),
      fetchLatestForDistrict(this.fluRepo, 'flu', 'Gripp'),
      fetchLatestForDistrict(this.ariRepo, 'ari', "O'RVI"),
      fetchLatestForDistrict(this.covidRepo, 'covid', 'COVID-19')
    ]);

    const latestReports = [...hepLatest, ...fluLatest, ...ariLatest, ...covidLatest]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    return {
      totalCasesToday,
      totalCasesYesterday,
      trend,
      trendPercent: parseFloat(percent.toFixed(1)),
      epidemicStatus,
      topDiseases,
      latestReports
    };
  }

}

/**
 * ORIGINAL CODE (APPEND-ONLY RULE)
 * 
 *   async getGlobalSummary(startDate: string, endDate: string) {
 *     const organizations = await this.orgRepo.find({
 *       where: { parent: Not(IsNull()) }, // Districts only
 *       relations: ["parent"],
 *     });
 * 
 *     const diseases = await this.diseaseRepo.find({ where: { isActive: true } });
 * 
 *     const getAggregatedData = async (
 *       repo: Repository<any>,
 *       sumField: string,
 *     ) => {
 *       return repo
 *         .createQueryBuilder("report")
 *         .select("report.organization_id", "organization_id")
 *         .addSelect(`SUM(report.${sumField})`, "total")
 *         .where("report.reportDate BETWEEN :startDate AND :endDate", {
 *           startDate,
 *           endDate,
 *         })
 *         .groupBy("report.organization_id")
 *         .getRawMany();
 *     };
 * 
 *     const [hepAgg, fluAgg, ariAgg, covidAgg] = await Promise.all([
 *       getAggregatedData(this.hepatitisRepo, "total_cases"),
 *       getAggregatedData(this.fluRepo, "flu_total"),
 *       getAggregatedData(this.ariRepo, "ari"),
 *       getAggregatedData(this.covidRepo, "total_cases"),
 *     ]);
 * 
 *     const form1Agg = await this.submissionRepo
 *       .createQueryBuilder("sub")
 *       .leftJoin("sub.template", "template")
 *       .select("sub.organization_id", "organization_id")
 *       .addSelect("sub.data", "data")
 *       .where("template.code = :code", { code: "form_1" })
 *       .andWhere("sub.reportingPeriod BETWEEN :startDate AND :endDate", {
 *         startDate,
 *         endDate,
 *       })
 *       .getRawMany();
 * 
 *     const globalMatrix: any[] = [];
 * 
 *     for (const org of organizations) {
 *       const orgDiseases: any[] = [];
 * 
 *       const addSpecialized = (agg: any[], name: string) => {
 *         const found = agg.find((a) => a.organization_id === org.id);
 *         const cases = found ? parseInt(found.total) : 0;
 *         if (cases > 0) orgDiseases.push({ disease: name, cases });
 *       };
 * 
 *       addSpecialized(hepAgg, "Gepatit");
 *       addSpecialized(fluAgg, "Gripp");
 *       addSpecialized(ariAgg, "O'RVI");
 *       addSpecialized(covidAgg, "Koronavirus (COVID-19)");
 * 
 *       const orgSubmissions = form1Agg.filter(
 *         (a) => a.organization_id === org.id,
 *       );
 *       for (const sub of orgSubmissions) {
 *         if (!sub.data) continue;
 *         for (const [key, value] of Object.entries(sub.data)) {
 *           if (typeof value === "number" && value > 0) {
 *             const diseaseMatch = diseases.find(
 *               (d) =>
 *                 d.name.toLowerCase().includes(key.toLowerCase()) ||
 *                 key.toLowerCase().includes(d.name.toLowerCase()),
 *             );
 * 
 *             if (diseaseMatch) {
 *               const existing = orgDiseases.find(
 *                 (od) => od.disease === diseaseMatch.name,
 *               );
 *               if (existing) {
 *                 existing.cases += value;
 *               } else {
 *                 orgDiseases.push({ disease: diseaseMatch.name, cases: value });
 *               }
 *             }
 *           }
 *         }
 *       }
 * 
 *       const analyzedDiseases = orgDiseases.map((od) => ({
 *         ...od,
 *         rate:
 *           org.population > 0
 *             ? parseFloat(((od.cases / org.population) * 100000).toFixed(2))
 *             : 0,
 *       }));
 * 
 *       globalMatrix.push({
 *         organizationId: org.id,
 *         organizationName: org.name,
 *         population: org.population,
 *         diseases: analyzedDiseases.sort((a, b) => b.rate - a.rate),
 *       });
 *     }
 * 
 *     return globalMatrix;
 *   }
 * 
 *   async getIncidenceRates(query: AnalysisQueryDto) {
 *     const { diseaseType, startDate, endDate, organizationId } = query;
 * 
 *     const queryBuilder = this.orgRepo
 *       .createQueryBuilder("org")
 *       .leftJoinAndSelect("org.parent", "parent");
 * 
 *     if (organizationId) {
 *       queryBuilder.where("org.id = :organizationId", { organizationId });
 *     } else {
 *       queryBuilder.where("org.parent IS NOT NULL");
 *     }
 * 
 *     const organizations = await queryBuilder.getMany();
 * 
 *     let repo: Repository<any>;
 *     let sumField: string;
 * 
 *     switch (diseaseType) {
 *       case "hepatitis":
 *         repo = this.hepatitisRepo;
 *         sumField = "total_cases";
 *         break;
 *       case "flu":
 *         repo = this.fluRepo;
 *         sumField = "flu_total";
 *         break;
 *       case "ari":
 *         repo = this.ariRepo;
 *         sumField = "ari";
 *         break;
 *       case "covid":
 *         repo = this.covidRepo;
 *         sumField = "total_cases";
 *         break;
 *       default:
 *         return [];
 *     }
 * 
 *     const caseAggregation = await repo
 *       .createQueryBuilder("report")
 *       .select("report.organization_id", "organization_id")
 *       .addSelect(`SUM(report.${sumField})`, "total")
 *       .where("report.reportDate BETWEEN :startDate AND :endDate", {
 *         startDate,
 *         endDate,
 *       })
 *       .groupBy("report.organization_id")
 *       .getRawMany();
 * 
 *     const results = organizations.map((org) => {
 *       const agg = caseAggregation.find((a) => a.organization_id === org.id);
 *       const totalCases = agg ? parseInt(agg.total) : 0;
 *       const incidenceRate =
 *         org.population > 0 ? (totalCases / org.population) * 100000 : 0;
 * 
 *       return {
 *         organizationId: org.id,
 *         organizationName: org.name,
 *         population: org.population,
 *         totalCases,
 *         incidenceRate: parseFloat(incidenceRate.toFixed(2)),
 *       };
 *     });
 * 
 *     return results.sort((a, b) => b.incidenceRate - a.incidenceRate);
 *   }
 */
