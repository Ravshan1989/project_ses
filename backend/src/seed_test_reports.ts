import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "./modules/daily-reports/entities/flu-daily-report.entity";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { Repository } from "typeorm";

async function seedReports() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const hepRepo = app.get(getRepositoryToken(HepatitisDailyReport)) as Repository<HepatitisDailyReport>;
        const fluRepo = app.get(getRepositoryToken(FluDailyReport)) as Repository<FluDailyReport>;
        const orgRepo = app.get(getRepositoryToken(Organization)) as Repository<Organization>;

        const orgs = await orgRepo.find({ take: 2 });
        if (orgs.length === 0) {
            console.log("No organizations found to seed reports.");
            return;
        }

        const today = new Date();
        const tashkentOffset = 5 * 60 * 60 * 1000;
        const dateStr = new Date(today.getTime() + tashkentOffset).toISOString().split('T')[0];

        for (const org of orgs) {
            // Hepatitis Report
            const hepReport = hepRepo.create({
                reportDate: dateStr,
                organization: org,
                total_cases: 15,
                lab_positive: 12,
                age_under_1: 2,
                age_1_3: 3,
                age_4_6: 4,
                age_7_14: 6,
                isTest: false,
                status: "APPROVED" as any
            });
            await hepRepo.save(hepReport);

            // Flu Report
            const fluReport = fluRepo.create({
                reportDate: dateStr,
                organization: org,
                ari_total: 45,
                ari_0_1: 10,
                ari_1_2: 12,
                ari_3_6: 15,
                ari_7_14: 8,
                flu_total: 5,
                isTest: false,
                status: "APPROVED" as any
            });
            await fluRepo.save(fluReport);

            console.log(`Seeded reports for ${org.name} on ${dateStr}`);
        }

        console.log("Seeding completed successfully.");
    } catch (err) {
        console.error("Seeding failed:", err);
    } finally {
        await app.close();
    }
}

seedReports();
