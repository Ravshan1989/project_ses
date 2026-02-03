import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseModule } from "./database/database.module";
import { SubmissionsModule } from "./modules/submissions/submissions.module";
import { UsersModule } from "./modules/users/users.module";
import { OrganizationsModule } from "./modules/organizations/organizations.module";
import { FormsModule } from "./modules/forms/forms.module";
import { DiseasesModule } from "./modules/diseases/diseases.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { ImportsModule } from "./modules/imports/imports.module";
import { DailyReportsModule } from "./modules/daily-reports/daily-reports.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";

import { AuthModule } from "./modules/auth/auth.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    AuthModule, // Added AuthModule
    SubmissionsModule,
    UsersModule,
    OrganizationsModule,
    FormsModule,
    DiseasesModule,
    ExportsModule,
    ImportsModule,
    DailyReportsModule,
    AnalysisModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
