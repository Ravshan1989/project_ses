import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { OrganizationsService } from "./modules/organizations/organizations.service";
import { User } from "./modules/users/entities/user.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";

async function testFilter() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const orgService = app.get(OrganizationsService);
    const userRepo: Repository<User> = app.get(getRepositoryToken(User));

    const admin = await userRepo.findOne({ where: { username: 'admin' }, relations: ['organization', 'organization.parent'] });
    if (admin) {
        const orgs = await orgService.findAll(admin);
        console.log(`User ${admin.username} (Role: ${admin.role}, Org: ${admin.organization?.name}) sees ${orgs.length} orgs.`);
    }

    // Creating a dummy Regional Mudir for testing
    // Note: We need a REAL user-like object that getRoleLevel can handle
    const dummyMudir: any = {
        role: 'DEPARTMENT_HEAD',
        organization: { id: '929c0389-9cd7-49a3-bd5f-f9a77db081c7', name: 'Toshkent viloyati', parent: null }
    };

    const mudirOrgs = await orgService.findAll(dummyMudir);
    console.log(`Regional Mudir sees ${mudirOrgs.length} orgs.`);
    mudirOrgs.forEach(o => console.log(` - ${o.name} (ParentID: ${o.parent?.id})`));

    const chirchiq = mudirOrgs.find(o => o.name.includes('Chirchiq'));
    console.log(`Chirchiq found in list: ${!!chirchiq}`);

    await app.close();
}

testFilter().catch(console.error);
