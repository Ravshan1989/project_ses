import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Disease } from './entities/disease.entity';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Injectable()
export class DiseasesService {
    constructor(
        @InjectRepository(Disease)
        private diseaseRepository: Repository<Disease>,
    ) { }

    async create(createDiseaseDto: CreateDiseaseDto): Promise<Disease> {
        const existing = await this.diseaseRepository.findOneBy({ code: createDiseaseDto.code });
        if (existing) {
            // Check if updates are needed (optional, or just update)
            const updated = this.diseaseRepository.merge(existing, createDiseaseDto);
            return this.diseaseRepository.save(updated);
        }
        const disease = this.diseaseRepository.create(createDiseaseDto);
        return this.diseaseRepository.save(disease);
    }

    async findAll(): Promise<Disease[]> {
        return this.diseaseRepository.find({
            order: { code: 'ASC' }
        });
    }

    async findOne(id: string): Promise<Disease> {
        const disease = await this.diseaseRepository.findOneBy({ id });
        if (!disease) {
            throw new NotFoundException(`Disease with ID ${id} not found`);
        }
        return disease;
    }

    async findByCode(code: string): Promise<Disease | null> {
        return this.diseaseRepository.findOneBy({ code });
    }

    async update(id: string, updateDiseaseDto: UpdateDiseaseDto): Promise<Disease> {
        const disease = await this.diseaseRepository.preload({
            id,
            ...updateDiseaseDto,
        });
        if (!disease) {
            throw new NotFoundException(`Disease with ID ${id} not found`);
        }
        return this.diseaseRepository.save(disease);
    }

    async remove(id: string): Promise<void> {
        const result = await this.diseaseRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`Disease with ID ${id} not found`);
        }
    }
}
