import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { RegisterDto } from '../auth/dto/register.dto'; // Re-use RegisterDto for creating users
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
        // We need to implement findAll in UsersService or use repository directly if we had checking
        // For now let's assume we will add findAll to service
        return this.usersService.findAll();
    }
}
