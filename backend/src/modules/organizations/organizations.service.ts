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
  ) {}

  // UZ: Faqat kerakli maydonlarni va faqat 'parent'ni yuklaymiz (children shart emas va sekinlashtiradi)
  async findAll(user?: User): Promise<Organization[]> {
    const allOrgs = await this.orgRepo.find({
      select: {
        id: true,
        name: true,
        parent: { id: true, name: true },
      },
      relations: ["parent"],
      order: {
        parent: { name: "ASC" },
        name: "ASC",
      },
    });

    if (user) {
      const level = getRoleLevel(user.role, user);
      if (level === 1) {
        return allOrgs; // Republic sees everything
      }
      if (level === 3 && user.organization) {
        return allOrgs.filter((o) => o.id === user.organization.id);
      }
      if (level === 2 && user.organization) {
        // Region sees itself and its children
        return allOrgs.filter(
          (o) =>
            o.id === user.organization.id ||
            o.parent?.id === user.organization.id,
        );
      }
    }

    return allOrgs;
  }

  async findByName(name: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { name } });
  }

  async findOne(id: string): Promise<Organization | null> {
    return this.orgRepo.findOne({ where: { id } });
  }

  async create(name: string, parentId?: string): Promise<Organization> {
    const org = this.orgRepo.create({
      name,
      parent: parentId ? { id: parentId } : undefined,
    });
    return this.orgRepo.save(org);
  }
}

/*
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * async findAll(): Promise<Organization[]> {
 *   return this.orgRepo.find({ relations: ['parent'] });
 * }
 */
