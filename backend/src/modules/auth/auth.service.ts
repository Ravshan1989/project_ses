import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { LoginDto } from "./dto/login.dto";
import { RegisterDto } from "./dto/register.dto";
import { User } from "../users/entities/user.entity";
import { TelegramService } from "../telegram/telegram.service";

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private telegramService: TelegramService,
  ) {}

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

    try {
      const newUser = await this.usersService.create({
        ...registerDto,
        username: tempUsername,
        passwordHash,
        isActive: false, // UZ: Admin tasdiqlamaguncha nofaol bo'ladi
      });

      // Fetch full user with relations (Organization, Department) for notification
      const fullUser = await this.usersService.findOne(newUser.id);

      // Send Telegram notification to admin
      if (fullUser) {
        await this.telegramService.sendRegistrationNotification(fullUser);
      }

      return newUser;
    } catch (error) {
      if (error.code === "23505") {
        // Postgres unique_violation
        throw new ConflictException(
          "Bu telefon raqam bilan foydalanuvchi allaqachon ro'yxatdan o'tgan.",
        );
      }
      throw error;
    }
  }
}
