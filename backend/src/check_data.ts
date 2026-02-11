import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DailyReportsService } from "./modules/daily-reports/daily-reports.service";
import { UsersService } from "./modules/users/users.service";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reportsService = app.get(DailyReportsService);
    const usersService = app.get(UsersService);

    const admin = await usersService.findOneByUsername("admin");
    const today = new Date().toISOString().split('T')[0];

    console.log(`Checking Hepatitis reports for date: ${today}`);
    const reports = await reportsService.getByDate(today, admin as any, false);

    console.log(`Found ${reports.length} real reports.`);
    if (reports.length > 0) {
        reports.forEach(r => {
            console.log(` - ${r.organization.name}: Total=${r.total_cases}`);
        });
    }

    await app.close();
}

bootstrap();
