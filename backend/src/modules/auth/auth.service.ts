import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "../users/entities/user.entity";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    console.log(`[DEBUG] Validating user: ${username}`);
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      console.log(`[DEBUG] User not found: ${username}`);
      return null;
    }

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    console.log(`[DEBUG] Password match for ${username}: ${isMatch}`);

    if (isMatch) {
      const { passwordHash, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.username, loginDto.password);
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Create Payload
    const payload = { username: user.username, sub: user.id, role: user.role };

    return {
      access_token: this.jwtService.sign(payload),
      user: user,
    };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    // UZ: Ro'yxatdan o'tishda login/parol avtomat generatsiya qilinadi (Telegram orqali beriladi)
    // Vaqtincha login sifatida telefon raqamini ishlatamiz
    const tempUsername = `reg_${registerDto.phoneNumber.replace(/\D/g, "")}`;
    const dummyPassword = Math.random().toString(36).slice(-8);
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(dummyPassword, salt);

    return this.usersService.create({
      ...registerDto,
      username: tempUsername,
      passwordHash,
      isActive: false, // UZ: Admin tasdiqlamaguncha nofaol bo'ladi
    });
  }
}
