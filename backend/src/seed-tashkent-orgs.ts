import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { OrganizationsService } from "./modules/organizations/organizations.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const orgService = app.get(OrganizationsService);

  const districts = [
    // Cities
    "Olmaliq sh",
    "Ohangaron sh",
    "Angren sh",
    "Bekobod sh",
    "Nurafshon sh",
    "Chirchiq sh",
    "Yangiyo'l sh",
    // Districts
    "Oqqo'rg'on t",
    "Ohangaron t",
    "Bekobod t",
    "Bo'stonliq t",
    "Bo'ka t",
    "Zangiota t",
    "Qibray t",
    "Quyi chirchiq t",
    "Parkent t",
    "Piskent t",
    "O'rta Chirchiq t",
    "Toshkent t",
    "Chinoz t",
    "Yuqori Chirchiq t",
    "Yangiyo'l t",
  ];

  console.log("Seeding Tashkent region districts...");

  let region = await orgService.findByName("Toshkent viloyati");
  if (!region) {
    console.log("Creating Toshkent viloyati parent...");
    region = await orgService.create("Toshkent viloyati");
  } else {
    console.log(`Using existing Toshkent viloyati (ID: ${region.id})`);
  }

  for (const name of districts) {
    const existing = await orgService.findByName(name);
    if (!existing) {
      console.log(`Creating: ${name}`);
      await orgService.create(name, region.id);
    } else if (!existing.parent) {
      console.log(`Linking existing: ${name}`);
      // Using direct repository update in service or just calling create with parentId
      await orgService.create(existing.name, region.id); 
    } else {
      console.log(`Already exists and linked: ${name} (Parent: ${existing.parent.name})`);
    }
  }

  console.log("Seeding completed successfully.");
  await app.close();
}

bootstrap();
