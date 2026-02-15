import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";

async function deepCheck() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orgRepo: Repository<Organization> = app.get(getRepositoryToken(Organization));

    const chirchiqs = await orgRepo.find({
        where: [
            { name: ILike('%Chirchiq%') }
        ],
        relations: ['parent']
    });

    console.log("--- CHIRCHIQ ORGS ---");
    chirchiqs.forEach(o => {
        console.log(`ID: ${o.id}, Name: ${o.name}, ParentID: ${o.parent?.id}, ParentName: ${o.parent?.name}`);
    });

    const regions = await orgRepo.find({ where: { parent: IsNull() } });
    console.log("--- REGIONS (PARENT IS NULL) ---");
    regions.forEach(r => {
        console.log(`ID: ${r.id}, Name: ${r.name}`);
    });

    await app.close();
}

import { IsNull } from "typeorm";

deepCheck().catch(console.error);
