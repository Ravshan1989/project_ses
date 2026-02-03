import { Controller, Get, Post, Body } from '@nestjs/common';
import { FormsService } from './forms.service';

@Controller('forms')
export class FormsController {
    constructor(private readonly formsService: FormsService) { }

    @Get('templates')
    findAll() {
        return this.formsService.findAll();
    }

    @Post('seed')
    async seed() {
        const templates = [
            { name: 'Shakl 1', code: 'FORM1', schemaDefinition: [] },
            { name: 'Emlash', code: 'VACCINATION', schemaDefinition: [] }
        ];
        for (const t of templates) {
            const existing = await this.formsService.findAll();
            if (!existing.find(e => e.code === t.code)) {
                await this.formsService.create(t.name, t.code);
            }
        }
        return { message: "Templates seeded" };
    }
}
