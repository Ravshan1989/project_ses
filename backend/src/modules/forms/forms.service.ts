import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Template } from "./entities/template.entity";

@Injectable()
export class FormsService {
  constructor(
    @InjectRepository(Template)
    private templateRepo: Repository<Template>,
  ) {}

  async findAll(): Promise<Template[]> {
    return this.templateRepo.find();
  }

  async findOne(id: string): Promise<Template | null> {
    return this.templateRepo.findOne({ where: { id } });
  }

  async create(
    name: string,
    code: string,
    schemaDefinition: any = [],
  ): Promise<Template> {
    const template = this.templateRepo.create({ name, code, schemaDefinition });
    return this.templateRepo.save(template);
  }
}
