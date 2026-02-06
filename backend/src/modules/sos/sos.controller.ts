import { Controller, Post, Body, Get, Patch, Param, UseGuards, Request, Delete } from '@nestjs/common';
import { SosService } from './sos.service';
import { CreateSosDiseaseDto } from './dto/create-sos-disease.dto';
import { CreateSosAlertDto } from './dto/create-sos-alert.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('sos')
@UseGuards(JwtAuthGuard)
export class SosController {
    constructor(private readonly sosService: SosService) { }

    // Predefined Diseases
    @Post('diseases')
    createDisease(@Body() dto: CreateSosDiseaseDto, @Request() req) {
        return this.sosService.createPredefinedDisease(dto, req.user);
    }

    @Get('diseases')
    getDiseases() {
        return this.sosService.getPredefinedDiseases();
    }

    @Delete('diseases/:id')
    deleteDisease(@Param('id') id: string, @Request() req) {
        return this.sosService.deletePredefinedDisease(id, req.user);
    }

    // SOS Alerts
    @Post('alerts')
    createAlert(@Body() dto: CreateSosAlertDto, @Request() req) {
        return this.sosService.createAlert(dto, req.user);
    }

    @Get('alerts')
    getAlerts(@Request() req) {
        return this.sosService.getAlerts(req.user);
    }

    @Patch('alerts/:id/review')
    markReviewed(@Param('id') id: string, @Request() req) {
        return this.sosService.markAsReviewed(id, req.user);
    }
}
