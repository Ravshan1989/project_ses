import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SosDisease } from "./entities/sos-disease.entity";
import { SosAlert } from "./entities/sos-alert.entity";
import { SosService } from "./sos.service";
import { SosController } from "./sos.controller";
import { TelegramModule } from "../telegram/telegram.module";

@Module({
  imports: [TypeOrmModule.forFeature([SosDisease, SosAlert]), TelegramModule],
  providers: [SosService],
  controllers: [SosController],
  exports: [SosService, TypeOrmModule],
})
export class SosModule { }
