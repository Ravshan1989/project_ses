import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KgWaterReport } from './entities/water-report.entity';
import { KgOpenWaterReport } from './entities/open-water-report.entity';
import { KgWaterUsageReport } from './entities/water-usage-report.entity';
import { KommunalHygieneService } from './kommunal-hygiene.service';
import { KommunalHygieneExportService } from './kommunal-hygiene-export.service';
import { KommunalHygieneController } from './kommunal-hygiene.controller';
import { OrganizationsModule } from '../organizations/organizations.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([KgWaterReport, KgOpenWaterReport, KgWaterUsageReport]),
        OrganizationsModule
    ],
    providers: [KommunalHygieneService, KommunalHygieneExportService],
    controllers: [KommunalHygieneController],
    exports: [KommunalHygieneService],
})
export class KommunalHygieneModule { }
