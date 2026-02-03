import { Controller, Post, Body, Get, UseGuards, Request, Patch, Param, Delete } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from '../auth/dto/register.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';
@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

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

    @Get()
    @Roles(UserRole.ADMIN) // Only Admin can view all users
    async findAll() {
        return this.usersService.findAll();
    }

    @Patch(':id')
    @Roles(UserRole.ADMIN)
    async update(@Param('id') id: string, @Body() updateData: any) {
        if (updateData.password) {
            const salt = await bcrypt.genSalt();
            updateData.passwordHash = await bcrypt.hash(updateData.password, salt);
            delete updateData.password;
        }
        return this.usersService.update(id, updateData);
    }

    @Delete(':id')
    @Roles(UserRole.ADMIN)
    async remove(@Param('id') id: string) {
        await this.usersService.remove(id);
        return { success: true };
    }
}
