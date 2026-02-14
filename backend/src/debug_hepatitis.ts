import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";

async function checkHepatitis() {
    const app = await NestFactory.createApplicationContext(AppModule);

    try {
        const targetDate = "2024-11-20";

        // Hepatitis Check
        const hepatitisRepo = app.get(getRepositoryToken(HepatitisDailyReport)) as Repository<HepatitisDailyReport>;
        const hepTotal = await hepatitisRepo.count();
        const hepTest = await hepatitisRepo.count({ where: { isTest: true } });
        console.log("--- HEPATITIS CHECK ---");
        console.log(`Total: ${hepTotal}, Test: ${hepTest}`);

        // Flu Check
        const { FluDailyReport } = require("./modules/daily-reports/entities/flu-daily-report.entity");
        const fluRepo = app.get(getRepositoryToken(FluDailyReport)) as Repository<any>;
        const fluTotal = await fluRepo.count();
        console.log("--- FLU CHECK ---");
        console.log(`Total: ${fluTotal}`);

        // Submissions Check
        const { Submission } = require("./modules/submissions/entities/submission.entity");
        const subRepo = app.get(getRepositoryToken(Submission)) as Repository<any>;
        const subTotal = await subRepo.count();
        console.log("--- SUBMISSIONS CHECK ---");
        console.log(`Total: ${subTotal}`);

        // Ari Check
        const { AriDailyReport } = require("./modules/daily-reports/entities/ari-daily-report.entity");
        const ariRepo = app.get(getRepositoryToken(AriDailyReport)) as Repository<any>;
        const ariTotal = await ariRepo.count();
        console.log("--- ARI CHECK ---");
        console.log(`Total: ${ariTotal}`);

        // Organizations Check
        const { Organization } = require("./modules/organizations/entities/organization.entity");
        const orgRepo = app.get(getRepositoryToken(Organization)) as Repository<any>;
        const orgs = await orgRepo.find();
        console.log("--- ORGANIZATIONS CHECK ---");
        orgs.forEach(o => {
            if (o.name.includes("*") || o.name.includes("_") || o.name.includes("[") || o.name.includes("`")) {
                console.log(`WARNING: Potential Markdown break in name: "${o.name}" (ID: ${o.id})`);
            }
        });
        console.log(`Checked ${orgs.length} organizations.`);

    } catch (err) {
        console.error("DEBUG SCRIPT FAILED:", err);
    } finally {
        await app.close();
    }
}

checkHepatitis();
