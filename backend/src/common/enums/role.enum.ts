export enum UserRole {
  ADMIN = "ADMIN",
  HR = "HR", // Kadrlar bo'limi xodimi
  REPUBLIC_HEAD = "REPUBLIC_HEAD", // Respublika Doirasida
  REGION_HEAD = "REGION_HEAD", // Viloyat Boshqarmasi Rahbari
  DISTRICT_HEAD = "DISTRICT_HEAD", // Tuman Bo'limi Rahbari
  LAB_HEAD = "LAB_HEAD", // Laboratoriya Mudiri
  STAFF = "STAFF", // Oddiy xodim

  // Tuman Darajasi Rollari (Forma 1 uchun)
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD", // Bo'lim boshlig'i / mudiri
  DISTRICT_SPECIALIST = "DISTRICT_SPECIALIST", // Tuman Mutaxassisi (Epi va Sanitar vrachlar o'rniga)
  DISTRICT_OPERATOR = "DISTRICT_OPERATOR", // Tuman Operatori (Epi va Sanitar yordamchilari o'rniga)

  // UZ: Yangi Sanitariya bo'limi rollari
  SANITARY_HEAD = "SANITARY_HEAD", // Tuman Sanitariya bo'limi mudiri
  SANITARY_SPECIALIST = "SANITARY_SPECIALIST", // Sanitar vrach
  SANITARY_OPERATOR = "SANITARY_OPERATOR", // Sanitar yordamchisi

  // UZ: Ijro intizomi bo'limi uchun yangi rol
  LEAD_SPECIALIST = "LEAD_SPECIALIST", // Yetakchi mutaxassis
}

/**
 * [ORIGINAL_REDACTED_CODE_PRESERVATION]
 *
 * export enum UserRole {
 *   ADMIN = "ADMIN",
 *   HR = "HR",
 *   REPUBLIC_HEAD = "REPUBLIC_HEAD",
 *   REGION_HEAD = "REGION_HEAD",
 *   DISTRICT_HEAD = "DISTRICT_HEAD",
 *   LAB_HEAD = "LAB_HEAD",
 *   STAFF = "STAFF",
 *   DEPARTMENT_HEAD = "DEPARTMENT_HEAD",
 *   DISTRICT_SPECIALIST = "DISTRICT_SPECIALIST",
 *   DISTRICT_OPERATOR = "DISTRICT_OPERATOR",
 * }
 */
