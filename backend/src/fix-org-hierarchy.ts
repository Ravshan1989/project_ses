import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, IsNull } from "typeorm";

async function fixOrgs() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orgRepo: Repository<Organization> = app.get(getRepositoryToken(Organization));

    let region = await orgRepo.findOne({ where: { name: "Toshkent viloyati" } });
    if (!region) {
        region = orgRepo.create({ name: "Toshkent viloyati", population: 3000000 });
        region = await orgRepo.save(region);
        console.log("Created region: Toshkent viloyati");
    }

    const districts = [
        "Olmaliq sh", "Ohangaron sh", "Angren sh", "Bekobod sh", "Nurafshon sh",
        "Chirchiq sh", "Yangiyo'l sh", "Oqqo'rg'on t", "Ohangaron t", "Bekobod t",
        "Bo'stonliq t", "Bo'ka t", "Zangiota t", "Qibray t", "Quyi chirchiq t",
        "Parkent t", "Piskent t", "O'rta Chirchiq t", "Toshkent t", "Chinoz t",
        "Yuqori Chirchiq t", "Yangiyo'l t"
    ];

    for (const name of districts) {
        const org = await orgRepo.findOne({ where: { name }, relations: ['parent'] });
        if (org) {
            if (!org.parent || org.parent.id !== region.id) {
                org.parent = region;
                await orgRepo.save(org);
                console.log(`Fixed parent for: ${name}`);
            } else {
                console.log(`Already correct: ${name}`);
            }
        } else {
            const newOrg = orgRepo.create({ name, parent: region, population: 100000 }); // Default pop
            await orgRepo.save(newOrg);
            console.log(`Created and linked: ${name}`);
        }
    }

    await app.close();
}

fixOrgs().catch(err => {
    console.error(err);
    process.exit(1);
});
