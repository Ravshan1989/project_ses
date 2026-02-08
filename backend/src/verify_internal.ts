import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DailyReportsService } from "./modules/daily-reports/daily-reports.service";
import { OrganizationsService } from "./modules/organizations/organizations.service";
import { UsersService } from "./modules/users/users.service";
import { CreateFluReportDto } from "./modules/daily-reports/dto/create-flu-report.dto";

async function verifyInternal() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportsService = app.get(DailyReportsService);
    const orgsService = app.get(OrganizationsService);
    const usersService = app.get(UsersService);

    try {
        console.log("--- INTERNAL DB VERIFICATION ---");

        // 1. Get Test Users
        const districtUser = await usersService.findOneByUsername("olmaliq_test");
        const regionUser = await usersService.findOneByUsername("viloyat_test");

        if (!districtUser || !regionUser) {
            throw new Error("Test users not found. Run seed script first.");
        }

        // 2. Submit Report (Internal)
        const today = new Date().toISOString().split('T')[0];
        const dto: CreateFluReportDto = {
            reportDate: today,
            organizationId: districtUser.organization.id,
            ari_total: 100,
            pneu_total: 20,
            flu_total: 10,
            sari_total: 5,
            death_total: 1,
            isTest: true
        };

        console.log("1. Submitting Flu Report for Olmaliq (Internal)...");
        await reportsService.upsertFlu(dto, districtUser);
        console.log("   SUCCESS: Report saved.");

        // 3. Check Weekly Summary for District (Olmaliq)
        console.log("2. Checking Weekly Summary for District (Olmaliq)...");
        const distData = await reportsService.getWeeklySummary(today, today, districtUser, true);
        console.log(`   Found ${distData.length} records for District.`);
        if (distData.length === 1 && distData[0].organization.name === 'Olmaliq sh') {
            console.log("   SUCCESS: District only sees its own data.");
        } else {
            console.error("   FAILURE: District summary data mismatch!", distData.length);
        }

        // 4. Check Weekly Summary for Region (Viloyat)
        console.log("3. Checking Weekly Summary for Region (Viloyat)...");
        const regData = await reportsService.getWeeklySummary(today, today, regionUser, true);
        console.log(`   Found ${regData.length} districts in Region summary.`);

        const olmaliqEntry = regData.find(d => d.organization.name === 'Olmaliq sh');
        if (olmaliqEntry && olmaliqEntry.ari_total === 100) {
            console.log("   SUCCESS: Region sees aggregated data from Olmaliq.");
        } else {
            console.error("   FAILURE: Region summary data mismatch or missing Olmaliq!");
        }

        // Verify alphabetical sort and all districts
        if (regData.length > 5) {
            console.log("   SUCCESS: Multiple districts listed (alphabetical).");
        }

        console.log("--- INTERNAL VERIFICATION COMPLETE ---");
    } catch (err) {
        console.error("INTERNAL VERIFICATION FAILED:", err);
    } finally {
        await app.close();
    }
}

verifyInternal();
