import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Request,
  Query,
} from "@nestjs/common";
import { SubmissionsService } from "./submissions.service";
import { CreateSubmissionDto } from "./dto/create-submission.dto";
import { UpdateStatusDto } from "./dto/update-status.dto";

import { RequirePermission } from "../../common/decorators/permissions.decorator";
import { PermissionsGuard } from "../auth/guards/permissions.guard";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("submissions")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SubmissionsController {
  constructor(private readonly submissionsService: SubmissionsService) { }

  @Post()
  @RequirePermission("EDIT_FORM1")
  create(@Body() createSubmissionDto: CreateSubmissionDto, @Request() req) {
    return this.submissionsService.create(createSubmissionDto, req.user);
  }

  @Get()
  @RequirePermission("VIEW_FORM1_TABLE1")
  findAll(@Query() query, @Request() req) {
    return this.submissionsService.findAll(query, req.user);
  }

  @Get("status-summary")
  @RequirePermission("VIEW_FORM1_TABLE1")
  getStatusSummary(
    @Query("templateCode") templateCode: string,
    @Query("period") period: string,
    @Query("isTest") isTest: string,
    @Request() req,
  ) {
    return this.submissionsService.getStatusSummary(templateCode, period, isTest === 'true', req.user);
  }

  @Get(":id")
  @RequirePermission("VIEW_FORM1_TABLE1")
  findOne(@Param("id") id: string, @Request() req) {
    return this.submissionsService.findOne(id, req.user);
  }

  @Patch(":id/status")
  @RequirePermission("APPROVE_FORM1")
  updateStatus(
    @Param("id") id: string,
    @Body() updateStatusDto: UpdateStatusDto,
    @Request() req,
  ) {
    return this.submissionsService.updateStatus(id, updateStatusDto, req.user);
  }
  // @Get('status-summary')
  // getStatusSummary(@Query('templateCode') templateCode: string, @Query('period') period: string) {
  //     return this.submissionsService.getStatusSummary(templateCode, period);
  // }
  @Post("cleanup-test")
  @RequirePermission("MANAGE_DEPARTMENTS")
  cleanupTest() {
    return this.submissionsService.cleanupTest();
  }
}
