import { Module } from "@nestjs/common";
import { UpdatesController } from "./updates.controller";
import { VersionController } from "./version.controller";
import { UpdatesService } from "./updates.service";

@Module({
  controllers: [UpdatesController, VersionController],
  providers: [UpdatesService],
  exports: [UpdatesService],
})
export class UpdatesModule {}
