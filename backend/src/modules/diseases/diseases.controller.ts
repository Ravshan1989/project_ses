import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { DiseasesService } from './diseases.service';
import { CreateDiseaseDto } from './dto/create-disease.dto';
import { UpdateDiseaseDto } from './dto/update-disease.dto';

@Controller('diseases')
export class DiseasesController {
    constructor(private readonly diseasesService: DiseasesService) { }

    @Post()
    create(@Body() createDiseaseDto: CreateDiseaseDto) {
        return this.diseasesService.create(createDiseaseDto);
    }

    @Get()
    findAll() {
        return this.diseasesService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.diseasesService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateDiseaseDto: UpdateDiseaseDto) {
        return this.diseasesService.update(id, updateDiseaseDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.diseasesService.remove(id);
    }
}
