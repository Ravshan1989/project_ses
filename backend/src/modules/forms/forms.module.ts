import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Template } from "./entities/template.entity";
import { FormsService } from "./forms.service";
import { FormsController } from "./forms.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Template])],
  providers: [FormsService],
  controllers: [FormsController],
  exports: [FormsService, TypeOrmModule],
})
export class FormsModule {}
