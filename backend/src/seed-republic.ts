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

  console.log("--- Republic-Wide Seeding Starting ---");

  // 1. Create/Find Republic Root
  let republic = await orgRepo.findOne({
    where: {
      name: "Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi xizmati",
    },
  });

  if (!republic) {
    console.log("Republic level not found, creating root node...");
    republic = orgRepo.create({
      name: "Sanitariya-epidemiologik osoyishtalik va jamoat salomatligi xizmati",
      population: 36000000, // Approx Uzbekistan population
    });
    republic = await orgRepo.save(republic);
    console.log("Republic root created.");
  }

  // 2. Map existing regions and add missing ones
  const REGIONS = [
    { name: "Toshkent viloyati", population: 3000000 },
    { name: "Toshkent shahri", population: 3000000 },
    { name: "Andijon viloyati", population: 3300000 },
    { name: "Buxoro viloyati", population: 2000000 },
    { name: "Farg'ona viloyati", population: 3900000 },
    { name: "Jizzax viloyati", population: 1500000 },
    { name: "Namangan viloyati", population: 2900000 },
    { name: "Navoiy viloyati", population: 1000000 },
    { name: "Qashqadaryo viloyati", population: 3400000 },
    { name: "Samarqand viloyati", population: 4000000 },
    { name: "Sirdaryo viloyati", population: 900000 },
    { name: "Surxondaryo viloyati", population: 2700000 },
    { name: "Xorazm viloyati", population: 1900000 },
    { name: "Qoraqalpog'iston Respublikasi", population: 2000000 },
  ];

  for (const regData of REGIONS) {
    let region = await orgRepo.findOne({ where: { name: regData.name } });
    if (!region) {
      console.log(`Creating region: ${regData.name}`);
      region = orgRepo.create({
        name: regData.name,
        population: regData.population,
        parent: republic,
      });
      await orgRepo.save(region);
    } else {
      // If region exists but has no parent, link it to Republic
      if (!region.parent) {
        console.log(`Linking existing region ${regData.name} to Republic root`);
        region.parent = republic;
        await orgRepo.save(region);
      }
    }
  }

  console.log("--- Republic-Wide Seeding Complete ---");
  await app.close();
}

bootstrap();
