import { IsString, Matches, MinLength, MaxLength } from "class-validator";

export class ChangePasswordDto {
  @IsString({ message: "Joriy parol kiritilmagan!" })
  oldPassword: string;

  @IsString()
  @MinLength(8, {
    message: "Parol kamida 8 ta belgidan iborat bo'lishi kerak!",
  })
  @MaxLength(32, {
    message: "Parol maksimal uzunligi 32 ta belgi bo'lishi kerak!",
  })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      "Parol juda oddiy! Katta va kichik harflar va sonlar yoki maxsus belgilar ishtirok etishi shart!",
  })
  newPassword: string;
}
