export enum UserRole {
  ADMIN = "ADMIN",
  REPUBLIC_HEAD = "REPUBLIC_HEAD", // Respublika Doirasida
  REGION_HEAD = "REGION_HEAD", // Viloyat Boshqarmasi Rahbari
  DISTRICT_HEAD = "DISTRICT_HEAD", // Tuman Bo'limi Rahbari
  LAB_HEAD = "LAB_HEAD", // Laboratoriya Mudiri
  STAFF = "STAFF", // Oddiy xodim

  // Tuman Darajasi Rollari (Forma 1 uchun)
  DEPARTMENT_HEAD = "DEPARTMENT_HEAD", // Bo'lim boshlig'i / mudiri
  DISTRICT_SPECIALIST = "DISTRICT_SPECIALIST", // Tuman Mutaxassisi (Epi va Sanitar vrachlar o'rniga)
  DISTRICT_OPERATOR = "DISTRICT_OPERATOR", // Tuman Operatori (Epi va Sanitar yordamchilari o'rniga)
}
