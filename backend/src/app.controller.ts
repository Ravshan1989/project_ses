import { Controller, Get } from "@nestjs/common";

@Controller()
export class AppController {
  @Get()
  getHello(): string {
    return "SES Backend is Online! Version: 1.0.2 (MANUAL CORS MIDDLWARE)";
  }
}
