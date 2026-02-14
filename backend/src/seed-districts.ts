import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orgRepo: Repository<Organization> = app.get(
        getRepositoryToken(Organization),
    );

    // 1. Ensure Region exists
    let region = await orgRepo.findOne({
        where: { name: "Toshkent viloyati" },
    });

    if (!region) {
        console.log("Region not found, creating...");
        region = orgRepo.create({
            name: "Toshkent viloyati",
            population: 3000000,

        });
        region = await orgRepo.save(region);
        console.log("Region created.");
    }

    const DISTRICTS = [
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

    console.log(`Checking ${DISTRICTS.length} districts...`);

    for (const data of DISTRICTS) {
        let district = await orgRepo.findOne({ where: { name: data.name } });
        if (!district) {
            district = orgRepo.create({
                name: data.name,
                population: data.population,
                child_population: Math.round(data.population * 0.3),
                parent: region,

            });
            await orgRepo.save(district);
            console.log(`Created district: ${data.name}`);
        } else {
            console.log(`District exists: ${data.name}`);
        }
    }

    console.log("District seeding complete.");
    await app.close();
}

bootstrap();
