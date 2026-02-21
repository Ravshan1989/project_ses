import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KgWaterReport } from './entities/water-report.entity';
import { KgOpenWaterReport } from './entities/open-water-report.entity';
import { KgWaterUsageReport } from './entities/water-usage-report.entity';
import { KommunalHygieneService } from './kommunal-hygiene.service';
import { KommunalHygieneController } from './kommunal-hygiene.controller';

@Module({
    imports: [TypeOrmModule.forFeature([KgWaterReport, KgOpenWaterReport, KgWaterUsageReport])],
    providers: [KommunalHygieneService],
    controllers: [KommunalHygieneController],
    exports: [KommunalHygieneService],
})
export class KommunalHygieneModule { }
