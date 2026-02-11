import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AnalysisService } from "./modules/analysis/analysis.service";
import { DailyReportsService } from "./modules/daily-reports/daily-reports.service";
import { OrganizationsService } from "./modules/organizations/organizations.service";
import { UsersService } from "./modules/users/users.service";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const analysisService = app.get(AnalysisService);
    const reportsService = app.get(DailyReportsService);
    const orgsService = app.get(OrganizationsService);
    const usersService = app.get(UsersService);

    // 1. Find Olmaliq
    const orgs = await orgsService.findAll();
    const olmaliq = orgs.find(o => o.name.includes("Olmaliq"));

    if (!olmaliq) {
        console.error("Olmaliq not found!");
        await app.close();
        return;
    }

    console.log(`Found Olmaliq: ID=${olmaliq.id}, Population=${olmaliq.population}`);

    // 2. Find a test user (district user)
    const user = await usersService.findOneByUsername("olmaliq_test");
    if (!user) {
        console.error("Test user not found!");
        await app.close();
        return;
    }

    const today = new Date().toISOString().split('T')[0];

    // 3. Insert Test Data (Indicators test)
    console.log("Inserting test reports...");

    // Flu: 14 cases -> Rate should be ~10.11 per 100k
    await reportsService.upsertFlu({
        reportDate: today,
        organizationId: olmaliq.id,
        ari_total: 100,
        pneu_total: 5,
        flu_total: 14,
        sari_total: 2,
        death_total: 0,
        isTest: true
    }, user);

    // Ari (Short): 50 cases -> Rate should be ~36.1 per 100k
    await reportsService.upsertAri({
        reportDate: today,
        organizationId: olmaliq.id,
        ari: 50,
        pneumonia: 2,
        gk: 1,
        isTest: true
    }, user);

    console.log("Test data inserted. Calculating indicators...");

    // 4. Verify Global Summary
    const globalSummary = await analysisService.getGlobalSummary(today, today);
    const olmaliqSummary = globalSummary.find(s => s.organizationId === olmaliq.id);

    if (olmaliqSummary) {
        console.log(`Summary for ${olmaliqSummary.organizationName}:`);
        olmaliqSummary.diseases.forEach(d => {
            console.log(` - ${d.disease}: Cases=${d.cases}, Rate=${d.rate}`);
        });
    } else {
        console.log("Olmaliq not found in summary!");
    }

    // 5. Verify Incidence Rates
    const fluRates = await analysisService.getIncidenceRates({
        diseaseType: 'flu',
        startDate: today,
        endDate: today
    } as any);

    const olmaliqFluRate = fluRates.find(r => r.organizationId === olmaliq.id);
    if (olmaliqFluRate) {
        console.log(`Flu Incidence Rate: ${olmaliqFluRate.incidenceRate} (Expected: ~10.11)`);
    }

    console.log("Verification complete!");

    // Cleanup
    await reportsService.cleanupTest();
    console.log("Cleanup done.");

    await app.close();
}

bootstrap();
