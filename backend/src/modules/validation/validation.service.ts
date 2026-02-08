import { Injectable, BadRequestException } from "@nestjs/common";

@Injectable()
export class ValidationService {
  // UZ: Kunlik hisobotlar uchun mantiqiy validatsiya
  validateDailyReport(data: any) {
    const ageFields = [
      "age_under_1",
      "age_1_3",
      "age_4_6",
      "age_7_14",
      "age_15_19",
      "age_20_plus",
    ];

    // UZ: Yosh guruhlari yig'indisini hisoblash
    const sumAges = ageFields.reduce(
      (sum, field) => sum + (data[field] || 0),
      0,
    );

    // UZ: Jami holatlar bilan solishtirish
    if (data.total_cases !== undefined && data.total_cases !== sumAges) {
      throw new BadRequestException(
        `Matematik xatolik: Jami holatlar (${data.total_cases}) yosh guruhlari yig'indisiga (${sumAges}) mos kelmaydi.`,
      );
    }

    return true;
  }

  // UZ: Form 1 uchun mantiqiy validatsiya (Kelajakda kengaytirish uchun)
  validateForm1(data: any) {
    // UZ: Hozircha oddiy true qaytaramiz
    return true;
  }
}
