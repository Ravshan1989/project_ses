import { Controller, Get, Post, Patch, Param, Body, UseGuards, Request, HttpException, HttpStatus } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UsersService } from '../users/users.service';
import { UserRole } from '../../common/enums/role.enum';
import * as bcrypt from 'bcrypt';

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.HR)
export class AdminUsersController {
    constructor(private usersService: UsersService) { }

    @Get()
    async getAllUsers(@Request() req) {
        const currentUser = req.user;

        // Admin sees all users, HR sees only their organization
        if (currentUser.role === UserRole.ADMIN) {
            return this.usersService.findAll();
        } else if (currentUser.role === UserRole.HR) {
            return this.usersService.findByOrganization(currentUser.organization.id);
        }

        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    @Get('pending')
    async getPendingUsers(@Request() req) {
        const currentUser = req.user;

        // Get users waiting for approval
        if (currentUser.role === UserRole.ADMIN) {
            return this.usersService.findPending();
        } else if (currentUser.role === UserRole.HR) {
            return this.usersService.findPendingByOrganization(currentUser.organization.id);
        }

        throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
    }

    @Post(':id/approve')
    async approveUser(@Param('id') id: string, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        // Generate username and password
        const username = this.generateUsername(user);
        const password = this.generatePassword();
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        // Update user
        user.username = username;
        user.passwordHash = passwordHash;
        user.isActive = true;
        user.approvedAt = new Date();

        await this.usersService.update(id, user);

        return {
            message: 'User approved successfully',
            username,
            password,
            user
        };
    }

    @Post(':id/reject')
    async rejectUser(@Param('id') id: string, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        // Delete user
        await this.usersService.remove(id);

        return { message: 'User rejected and removed' };
    }

    @Patch(':id')
    async updateUser(@Param('id') id: string, @Body() updateData: any, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        await this.usersService.update(id, updateData);

        return { message: 'User updated successfully' };
    }

    @Post(':id/deactivate')
    async deactivateUser(@Param('id') id: string, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        await this.usersService.update(id, { isActive: false });

        return { message: 'User deactivated successfully' };
    }

    @Post(':id/activate')
    async activateUser(@Param('id') id: string, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        await this.usersService.update(id, { isActive: true });

        return { message: 'User activated successfully' };
    }

    @Post(':id/reset-password')
    async resetPassword(@Param('id') id: string, @Request() req) {
        const currentUser = req.user;
        const user = await this.usersService.findOne(id);

        if (!user) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        // Check permissions
        if (currentUser.role === UserRole.HR && user.organization.id !== currentUser.organization.id) {
            throw new HttpException('Unauthorized', HttpStatus.FORBIDDEN);
        }

        // Generate new password
        const password = this.generatePassword();
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        await this.usersService.update(id, { passwordHash });

        return {
            message: 'Password reset successfully',
            password
        };
    }

    private generateUsername(user: any): string {
        const firstName = user.firstName?.toLowerCase().replace(/\s+/g, '') || '';
        const lastName = user.lastName?.toLowerCase().replace(/\s+/g, '') || '';

        if (firstName && lastName) {
            return `${firstName}.${lastName}`;
        } else {
            return `user_${Date.now()}`;
        }
    }

    private generatePassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 10; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    }
}
