import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function deepReportCheck() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportRepo: Repository<HepatitisDailyReport> = app.get(getRepositoryToken(HepatitisDailyReport));

    const reports = await reportRepo.find({
        where: { organization: { name: 'Chirchiq sh' } },
        relations: ['organization'],
        order: { reportDate: 'DESC' }
    });

    console.log("--- CHIRCHIQ REPORTS ---");
    reports.forEach(r => {
        console.log(`ID: ${r.id}, Date: ${r.reportDate}, isTest: ${r.isTest}, Status: ${r.status}`);
    });

    await app.close();
}

deepReportCheck().catch(console.error);
