import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DataExportService {
    private readonly logger = new Logger(DataExportService.name);

    constructor(private dataSource: DataSource) { }

    async exportAllData() {
        try {
            this.logger.log('Barcha ma\'lumotlarni eksport qilish boshlandi...');

            const entityManager = this.dataSource.createEntityManager();
            const tablesRes = await entityManager.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

            const tables = tablesRes.rows ? tablesRes.rows.map(r => r.table_name) : tablesRes.map(r => r.table_name);
            const backupData: any = {};

            for (const table of tables) {
                try {
                    // Skip TypeORM migration and system tables if they exist
                    if (table.includes('migrations') || table === 'spatial_ref_sys') continue;

                    const data = await entityManager.query(`SELECT * FROM "${table}"`);
                    backupData[table] = data;
                } catch (err) {
                    this.logger.error(`Jadvalni eksport qilishda xatolik (${table}): ${err.message}`);
                }
            }

            this.logger.log('Ma\'lumotlar muvaffaqiyatli eksport qilindi.');
            return JSON.stringify(backupData, null, 2);
        } catch (error) {
            this.logger.error(`Eksport qilishda xatolik: ${error.message}`);
            throw error;
        }
    }
}
