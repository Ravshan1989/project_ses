import { IsString, IsOptional, IsEnum } from "class-validator";
import { UserRole } from "../../../common/enums/role.enum";
import { LoginDto } from "./login.dto";

export class RegisterDto extends LoginDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  middleName: string;

  @IsString()
  phoneNumber: string;

  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  dynamicRoleId?: string; // UZ: Yangi dinamik rol ID si

  @IsString()
  @IsOptional()
  departmentId?: string; // UZ: Bo'lim ID si
}
