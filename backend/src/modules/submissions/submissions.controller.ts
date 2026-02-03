import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request, Query } from '@nestjs/common';
import { SubmissionsService } from './submissions.service';
import { CreateSubmissionDto } from './dto/create-submission.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

// Mock Auth Guard - In real app, import from AuthModule
// @UseGuards(JwtAuthGuard)
@Controller('submissions')
export class SubmissionsController {
    constructor(private readonly submissionsService: SubmissionsService) { }

    @Post()
    create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
        // In real app, user is attached to req by Guard
        const mockUser = req.user || { id: 'mock-user-id', role: 'STAFF', organization: { id: 'mock-org' } };
        return this.submissionsService.create(createSubmissionDto, mockUser);
    }

    @Get()
    findAll(@Query() query) {
        return this.submissionsService.findAll(query);
    }


    @Get('status-summary')
    getStatusSummary(@Query('templateCode') templateCode: string, @Query('period') period: string) {
        return this.submissionsService.getStatusSummary(templateCode, period);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.submissionsService.findOne(id);
    }

    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateStatusDto, @Request() req) {
        const mockUser = req.user || { id: 'mock-admin-id', role: 'REGION_HEAD' };
        return this.submissionsService.updateStatus(id, updateStatusDto, mockUser);
    }
    // @Get('status-summary')
    // getStatusSummary(@Query('templateCode') templateCode: string, @Query('period') period: string) {
    //     return this.submissionsService.getStatusSummary(templateCode, period);
    // }
}
