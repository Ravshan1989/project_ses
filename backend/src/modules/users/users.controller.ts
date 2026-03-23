import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Patch,
  Param,
  Delete,
  Res, // Added Res import
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { RegisterDto } from "../auth/dto/register.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "../../common/enums/role.enum";
import * as bcrypt from "bcrypt";
import { Response } from "express";
import * as ExcelJS from "exceljs";

@Controller("users")
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get("export")
  @Roles(UserRole.ADMIN)
  async exportUsers(@Res() res: Response) {
    const users = await this.usersService.findAll();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Users");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Username", key: "username", width: 20 },
      { header: "Full Name", key: "fullName", width: 30 },
      { header: "Role", key: "role", width: 15 },
      { header: "Organization", key: "organization", width: 30 },
      { header: "Password (Hash)", key: "passwordHash", width: 40 },
      { header: "Created At", key: "createdAt", width: 20 },
    ];

    users.forEach((user) => {
      worksheet.addRow({
        id: user.id,
        username: user.username,
        fullName: `${user.lastName || ""} ${user.firstName || ""}`.trim(), // Fixed fullName access
        role: user.role,
        organization: user.organization ? user.organization.name : "N/A",
        passwordHash: user.passwordHash,
        createdAt: user.createdAt,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_export.xlsx",
    );

    await workbook.xlsx.write(res);
    res.end();
  }

  @Post()
  @Roles(UserRole.ADMIN) // Only Admin can create users directly
  async create(@Body() createUserDto: RegisterDto) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(createUserDto.password, salt);

    return this.usersService.create({
      ...createUserDto,
      passwordHash,
    });
  }

  @Patch("push-token")
  @UseGuards(JwtAuthGuard)
  updatePushToken(@Request() req, @Body("token") token: string) {
    return this.usersService.updatePushToken(req.user.id, token);
  }

  @Get()
  async findAll(@Request() req: any) {
    return this.usersService.findAll(req.user);
  }

  @Patch(":id")
  @Roles(UserRole.ADMIN)
  async update(@Param("id") id: string, @Body() updateData: any) {
    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
      delete updateData.password;
    }
    return this.usersService.update(id, updateData);
  }

  @Delete(":id")
  @Roles(UserRole.ADMIN)
  async remove(@Param("id") id: string) {
    await this.usersService.remove(id);
    return { success: true };
  }
}
