import { DataSource } from 'typeorm';
import { Organization } from './src/modules/organizations/entities/organization.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkOrgs() {
    const ds = new DataSource({
        type: 'postgres',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        username: process.env.DB_USERNAME || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        database: process.env.DB_NAME || 'regionstat',
        entities: [Organization],
        synchronize: false,
    });

    try {
        await ds.initialize();
        const repo = ds.getRepository(Organization);
        const all = await repo.find({ relations: ['parent'] });
        
        console.log('--- REGIONS ---');
        const regions = all.filter(o => !o.parent);
        regions.forEach(r => {
            const children = all.filter(c => c.parent?.id === r.id);
            console.log(`${r.name} (ID: ${r.id}) - Children: ${children.length}`);
        });

        console.log('--- DISTRICTS WITH NO PARENT ---');
        const orphans = all.filter(o => o.parent === null && !regions.includes(o));
        // Actually regions are orphans too. Let's list everything.
        
        console.log('\n--- ALL ORGANIZATIONS ---');
        all.forEach(o => {
            console.log(`[${o.id}] ${o.name} -> Parent: ${o.parent?.name || 'NONE'}`);
        });

    } catch (e) {
        console.error(e);
    } finally {
        await ds.destroy();
    }
}

checkOrgs();
