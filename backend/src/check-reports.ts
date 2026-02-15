import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function checkReports() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportRepo: Repository<HepatitisDailyReport> = app.get(getRepositoryToken(HepatitisDailyReport));

    const all = await reportRepo.find({
        relations: ['organization'],
        order: { reportDate: 'DESC' },
        take: 20
    });
    console.log("--- REPORTS START ---");
    all.forEach(r => {
        console.log(`Date: ${r.reportDate}, Org: ${r.organization?.name}, ID: ${r.id}`);
    });
    console.log("--- REPORTS END ---");

    await app.close();
}

checkReports().catch(console.error);
