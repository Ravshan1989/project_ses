import { Controller, Get, Post, Body } from "@nestjs/common";
import { OrganizationsService } from "./organizations.service";

@Controller("organizations")
export class OrganizationsController {
  constructor(private readonly orgService: OrganizationsService) {}

  @Get()
  findAll() {
    return this.orgService.findAll();
  }

  @Post("seed")
  async seed() {
    const districts = [
      "Olmaliq sh",
      "Ohangaron sh",
      "Angren sh",
      "Bekobod sh",
      "Nurafshon sh",
      "Chirchiq sh",
      "Yangiyo'l sh",
      "Oqqo'rg'on t",
      "Ohangaron t",
      "Bekobod t",
      "Bo'stonliq t",
      "Bo'ka t",
      "Zangiota t",
      "Qibray t",
      "Quyi chirchiq t",
      "Parkent t",
      "Piskent t",
      "O'rta Chirchiq t",
      "Toshkent t",
      "Chinoz t",
      "Yuqori Chirchiq t",
      "Yangiyo'l t",
    ];

    for (const name of districts) {
      const existing = await this.orgService.findByName(name);
      if (!existing) {
        await this.orgService.create(name);
      }
    }
    return { message: "Seeded districts successfully" };
  }
}
