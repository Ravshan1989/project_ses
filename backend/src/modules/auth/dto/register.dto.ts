import { IsString, IsOptional, IsEnum } from 'class-validator';
import { UserRole } from '../../../common/enums/role.enum';
import { LoginDto } from './login.dto';

export class RegisterDto extends LoginDto {
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @IsString()
    @IsOptional()
    organizationId?: string;
}
