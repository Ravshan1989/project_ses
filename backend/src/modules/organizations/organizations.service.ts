import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Organization } from "./entities/organization.entity";
import { User } from "../users/entities/user.entity";
import { getRoleLevel } from "../../common/utils/role.util";

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
  async findAll(user?: User): Promise<Organization[]> {
    const allOrgs = await this.orgRepo.find({ relations: ["parent"] });

    if (user) {
      const level = getRoleLevel(user.role, user);
      if (level === 3 && user.organization) {
        return allOrgs.filter(o => o.id === user.organization.id);
      }
      if (level === 2 && user.organization) {
        return allOrgs.filter(o => o.parent?.id === user.organization.id);
      }
    }

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
