import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UsersService } from "../users/users.service";
import { UserRole } from "../../common/enums/role.enum";
import * as bcrypt from "bcrypt";
import { validateOrganizationAccess } from "../../common/utils/access-control.util";

@Controller("admin/users")
@UseGuards(JwtAuthGuard, RolesGuard)
// @Roles(UserRole.ADMIN, UserRole.HR, UserRole.REPUBLIC_HEAD, UserRole.REGION_HEAD, UserRole.DISTRICT_HEAD) // ESKI
@Roles(UserRole.ADMIN, UserRole.HR)
export class AdminUsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  async getAllUsers(@Request() req) {
    return this.usersService.findAll(req.user);
  }

  @Get("pending")
  async getPendingUsers(@Request() req) {
    return this.usersService.findPending(req.user);
  }

  @Post(":id/approve")
  async approveUser(@Param("id") id: string, @Request() req) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    const result = await this.usersService.approveUser(id);

    return {
      message: "User approved successfully",
      username: result.user.username,
      password: result.password,
      user: result.user,
    };
  }

  @Post(":id/reject")
  async rejectUser(@Param("id") id: string, @Request() req) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    // Delete user
    await this.usersService.remove(id);

    return { message: "User rejected and removed" };
  }

  @Patch(":id")
  async updateUser(
    @Param("id") id: string,
    @Body() updateData: any,
    @Request() req,
  ) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.usersService.update(id, updateData);

    return { message: "User updated successfully" };
  }

  @Post(":id/deactivate")
  async deactivateUser(@Param("id") id: string, @Request() req) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.usersService.update(id, { isActive: false });

    return { message: "User deactivated successfully" };
  }

  @Post(":id/activate")
  async activateUser(@Param("id") id: string, @Request() req) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    await this.usersService.update(id, { isActive: true });

    return { message: "User activated successfully" };
  }

  @Post(":id/reset-password")
  async resetPassword(@Param("id") id: string, @Request() req) {
    const currentUser = req.user;
    const user = await this.usersService.findOne(id);

    if (!user) {
      throw new HttpException("User not found", HttpStatus.NOT_FOUND);
    }

    // Check permissions using validateOrganizationAccess
    if (user.organization?.id) {
      validateOrganizationAccess(currentUser, user.organization.id);
    } else if (currentUser.role !== UserRole.ADMIN) {
      throw new HttpException(
        "Sizda ushbu foydalanuvchini boshqarish ruxsati yo'q",
        HttpStatus.FORBIDDEN,
      );
    }

    const { password } = await this.usersService.resetPassword(id);

    return {
      message: "Password reset successfully",
      password,
    };
  }
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * @Controller("admin/users")
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles(UserRole.ADMIN, UserRole.HR)
 * export class AdminUsersController {
 *   constructor(private usersService: UsersService) {}
 *
 *   @Get()
 *   async getAllUsers(@Request() req) {
 *     if (req.user.role === UserRole.ADMIN) {
 *       return this.usersService.findAll();
 *     } else if (req.user.role === UserRole.HR) {
 *       return this.usersService.findByOrganization(req.user.organization.id);
 *     }
 *     throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
 *   }
 *
 *   @Get("pending")
 *   async getPendingUsers(@Request() req) {
 *     if (req.user.role === UserRole.ADMIN) {
 *       return this.usersService.findPending();
 *     } else if (req.user.role === UserRole.HR) {
 *       return this.usersService.findPendingByOrganization(req.user.organization.id);
 *     }
 *     throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
 *   }
 *
 *   @Post(":id/approve")
 *   async approveUser(@Param("id") id: string, @Request() req) {
 *     const currentUser = req.user;
 *     const user = await this.usersService.findOne(id);
 *
 *     if (!user) {
 *       throw new HttpException("User not found", HttpStatus.NOT_FOUND);
 *     }
 *
 *     // Check permissions
 *     if (
 *       currentUser.role === UserRole.HR &&
 *       user.organization.id !== currentUser.organization.id
 *     ) {
 *       throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
 *     }
 *
 *     const result = await this.usersService.approveUser(id);
 *
 *     return {
 *       message: "User approved successfully",
 *       username: result.user.username,
 *       password: result.password,
 *       user: result.user,
 *     };
 *   }
 *
 *   @Post(":id/reject")
 *   async rejectUser(@Param("id") id: string, @Request() req) {
 *     const currentUser = req.user;
 *     const user = await this.usersService.findOne(id);
 *
 *     if (!user) {
 *       throw new HttpException("User not found", HttpStatus.NOT_FOUND);
 *     }
 *
 *     // Check permissions
 *     if (
 *       currentUser.role === UserRole.HR &&
 *       user.organization.id !== currentUser.organization.id
 *     ) {
 *       throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
 *     }
 *
 *     // Delete user
 *     await this.usersService.remove(id);
 *
 *     return { message: "User rejected and removed" };
 *   }
 *
 *   @Patch(":id")
 *   async updateUser(
 *     @Param("id") id: string,
 *     @Body() updateData: any,
 *     @Request() req,
 *   ) {
 *     const currentUser = req.user;
 *     const user = await this.usersService.findOne(id);
 *
 *     if (!user) {
 *       throw new HttpException("User not found", HttpStatus.NOT_FOUND);
 *     }
 *
 *     // Check permissions
 *     if (
 *       currentUser.role === UserRole.HR &&
 *       user.organization.id !== currentUser.organization.id
 *     ) {
 *       throw new HttpException("Unauthorized", HttpStatus.FORBIDDEN);
 *     }
 *
 *     await this.usersService.update(id, updateData);
 *
 *     return { message: "User updated successfully" };
 *   }
 * }
 */
