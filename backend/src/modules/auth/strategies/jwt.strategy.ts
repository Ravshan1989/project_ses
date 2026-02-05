import { ExtractJwt, Strategy } from "passport-jwt";
import { PassportStrategy } from "@nestjs/passport";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { UsersService } from "../../users/users.service";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey:
        configService.get<string>("JWT_SECRET") || "s3cr3t_k3y_f0r_d3v",
    });
  }

  // UZ: Eski kod - faqat tokendagi payloadni qaytarardi
  /*
  async validate(payload: any) {
    return {
      userId: payload.sub,
      username: payload.username,
      role: payload.role,
    };
  }
  */

  async validate(payload: any) {
    // UZ: Bazadan to'liq userni (tashkilot va ruxsatlar bilan) oladi
    try {
      if (!payload.sub) return null;
      const user = await this.usersService.findOne(payload.sub);
      if (!user) {
        console.warn(`JWT Validation: User not found for ID: ${payload.sub}`);
        return null;
      }
      return user;
    } catch (error) {
      console.error("JWT Validation error:", error);
      return null;
    }
  }
}
