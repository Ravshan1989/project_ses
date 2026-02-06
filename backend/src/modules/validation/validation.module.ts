import { Module, Global } from "@nestjs/common";
import { ValidationService } from "./validation.service";

@Global() // UZ: Barcha modullarda ishlatish uchun global qildik
@Module({
    providers: [ValidationService],
    exports: [ValidationService],
})
export class ValidationModule { }
