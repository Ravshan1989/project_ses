import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Organization } from "./entities/organization.entity";

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private orgRepo: Repository<Organization>,
  ) { }

  /* 
    ESKI KOD (Barcha tashkilotlarni, jumladan viloyat darajasini ham qaytaradi):
    async findAll(): Promise<Organization[]> {
        return this.orgRepo.find({ relations: ['parent'] });
    }
    */

  // YANGI YECHIM (Faqat tuman va shaharlarni qaytaradi, ya'ni 'parent'i borlarni):
  async findAll(): Promise<Organization[]> {
    const allOrgs = await this.orgRepo.find({ relations: ["parent"] });
    // Faqat ota-onasi bor tashkilotlarni (tumanlarni) qaytaramiz
    // UZ: Hozircha barcha tashkilotlarni qaytaramiz, chunki seed qilinganlarda parent yo'q
    // return allOrgs.filter((org) => !!org.parent);
    return allOrgs;
  }

  async findByName(name: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { name } });
  }

  async create(name: string, parentId?: string): Promise<Organization> {
    const org = this.orgRepo.create({
      name,
      parent: parentId ? { id: parentId } : undefined,
    });
    return this.orgRepo.save(org);
  }
}
