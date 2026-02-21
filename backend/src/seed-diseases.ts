import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DiseasesService } from "./modules/diseases/diseases.service";
import * as fs from "fs";
import * as path from "path";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const diseasesService = app.get(DiseasesService);

    const diseasesPath = path.join(__dirname, "../../disease_list.json");
    const diseasesData = JSON.parse(fs.readFileSync(diseasesPath, "utf8"));

    console.log(`Found ${diseasesData.length} diseases to seed...`);

    for (const disease of diseasesData) {
        await diseasesService.create({
            code: disease.code,
            name: disease.name,
            reportFrequency: disease.reportFrequency || ["DAILY", "MONTHLY"],
            isActive: disease.isActive !== undefined ? disease.isActive : true,
        });
        console.log(`Processed Disease: [${disease.code}] ${disease.name}`);
    }

    console.log("Disease seeding complete!");
    await app.close();
}

bootstrap();
