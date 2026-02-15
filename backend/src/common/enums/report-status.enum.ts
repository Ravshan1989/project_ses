export enum ReportStatus {
  DRAFT = "DRAFT", // Xodim kiritgan (Qoralama)
  SUBMITTED = "SUBMITTED", // Xodim yuborgan (Mudir ko'radi)
  VERIFIED = "VERIFIED", // Mudir tasdiqlagan (1-QR)
  APPROVED = "APPROVED", // Rahbar tasdiqlagan (2-QR - Yakuniy)
  REJECTED = "REJECTED", // Qaytarilgan
}
