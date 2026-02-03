import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Body,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ImportsService } from "./imports.service";
import { Express } from "express";

@Controller("imports")
export class ImportsController {
  constructor(private readonly importsService: ImportsService) {}

  @Post("global")
  @UseInterceptors(FileInterceptor("file"))
  async importGlobal(
    @UploadedFile() file: Express.Multer.File,
    @Body("type") type: string,
  ) {
    if (!file) {
      throw new BadRequestException("Fayl yuklanmadi");
    }
    if (!type) {
      throw new BadRequestException("Hisobot turi tanlanmadi");
    }

    return this.importsService.processImport(file, type);
  }
}
