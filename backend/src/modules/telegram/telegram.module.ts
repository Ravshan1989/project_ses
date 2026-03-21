import { Module, Global, forwardRef } from "@nestjs/common";
import { TelegramService } from "./telegram.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "../users/entities/user.entity";
import { UsersModule } from "../users/users.module";

import { DataExportService } from "./data-export.service";
import { BackupBotService } from "./backup-bot.service";
import { SosBotService } from "./sos-bot.service";

import { Organization } from "../organizations/entities/organization.entity";
import { OrganizationsModule } from "../organizations/organizations.module";

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([User, Organization]),
    forwardRef(() => UsersModule),
    forwardRef(() => OrganizationsModule),
  ],
  providers: [
    TelegramService,
    DataExportService,
    BackupBotService,
    SosBotService,
  ],
  exports: [TelegramService, DataExportService, SosBotService],
})
export class TelegramModule {}
