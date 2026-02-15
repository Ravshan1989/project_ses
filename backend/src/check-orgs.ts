import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Organization } from "./modules/organizations/entities/organization.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function checkOrgs() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orgRepo: Repository<Organization> = app.get(getRepositoryToken(Organization));

    const all = await orgRepo.find({ relations: ['parent'] });
    console.log("--- ORGANIZATIONS START ---");
    all.forEach(o => {
        console.log(`ID: ${o.id}, Name: ${o.name}, ParentID: ${o.parent?.id}, ParentName: ${o.parent?.name}`);
    });
    console.log("--- ORGANIZATIONS END ---");

    await app.close();
}

checkOrgs();
