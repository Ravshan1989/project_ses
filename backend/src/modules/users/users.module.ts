import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./entities/user.entity";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { AdminUsersController } from "./admin-users.controller";

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController, AdminUsersController],
  providers: [UsersService],
  exports: [UsersService], // Export UsersService for AuthModule
})
export class UsersModule {}
