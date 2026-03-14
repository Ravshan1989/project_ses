import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Submission } from "./modules/submissions/entities/submission.entity";
import { HepatitisDailyReport } from "./modules/daily-reports/entities/hepatitis-daily-report.entity";
import { FluDailyReport } from "./modules/daily-reports/entities/flu-daily-report.entity";
import { AriDailyReport } from "./modules/daily-reports/entities/ari-daily-report.entity";
import { EpidemiologyDailyReport } from "./modules/daily-reports/entities/epidemiology-daily-report.entity";
import { CovidDailyReport } from "./modules/daily-reports/entities/covid-daily-report.entity";
import { DiarrheaDailyReport } from "./modules/daily-reports/entities/diarrhea-daily-report.entity";
import { SanitaryDailyReport } from "./modules/daily-reports/entities/sanitary-daily-report.entity";

async function bootstrap() {
  console.log("Starting full data cleanup...");
  const app = await NestFactory.createApplicationContext(AppModule);

  const entities = [
    Submission,
    HepatitisDailyReport,
    FluDailyReport,
    AriDailyReport,
    EpidemiologyDailyReport,
    CovidDailyReport,
    DiarrheaDailyReport,
    SanitaryDailyReport,
  ];

  for (const entity of entities) {
    const repo: Repository<any> = app.get(getRepositoryToken(entity));
    const count = await repo.count();
    if (count > 0) {
      console.log(`Deleting ${count} records from ${entity.name}...`);
      await repo.delete({});
    } else {
      console.log(`${entity.name} is already empty.`);
    }
  }

  console.log("Finalizing cleanup...");
  await app.close();
  console.log("Cleanup complete!");
}

bootstrap();
