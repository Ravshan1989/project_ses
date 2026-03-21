import { IsString, IsOptional, IsEnum } from "class-validator";
import { UserRole } from "../../../common/enums/role.enum";
import { LoginDto } from "./login.dto";

export class RegisterDto {
  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsString()
  middleName: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  organizationId?: string;

  @IsString()
  @IsOptional()
  dynamicRoleId?: string; // UZ: Yangi dinamik rol ID si

  @IsString()
  @IsOptional()
  departmentId?: string; // UZ: Bo'lim ID si

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  password?: string;
}
