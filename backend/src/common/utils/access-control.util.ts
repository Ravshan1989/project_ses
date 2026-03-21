import { UserRole } from "../enums/role.enum";
import { getRoleLevel } from "./role.util";

/**
 * UZ: Foydalanuvchining ma'lum bir tashkilot ma'lumotlariga kirish huquqini tekshiradi.
 * Agar huquqi bo'lmasa, uning o'z tashkiloti ID sini qaytaradi (xavfsiz filtr).
 */
export const validateOrganizationAccess = (
  user: any,
  requestedOrgId: string,
): string => {
  if (!user || !user.role) return requestedOrgId;

  const level = getRoleLevel(user.role, user);

  // 1. Respublika darajasi (Hamma narsani ko'ra oladi)
  if (level === 1) {
    return requestedOrgId || user.organization?.id;
  }

  // Agar foydalanuvchining tashkiloti aniqlanmagan bo'lsa (faqat Respublika adminlarida bo'lishi mumkin)
  if (!user.organization) {
    if (level === 1) return requestedOrgId;
    throw new Error("Foydalanuvchi tashkiloti aniqlanmadi");
  }

  const userOrgId = user.organization.id;

  // 2. Viloyat darajasi (Faqat o'zini va tumanlarini ko'ra oladi)
  if (level === 2) {
    // Agar so'ralgan tashkilot o'zi bo'lsa - ruxsat
    if (requestedOrgId === userOrgId) return requestedOrgId;

    // Agar so'ralgan tashkilot uning farzandi bo'lsa - ruxsat
    // Eslatma: user.organization.children relations orqali yuklangan bo'lishi kerak.
    // Lekin controllerda bizda faqat ID bor.
    // Shuning uchun eng xavfsiz yo'li: agar requestedOrgId berilmagan bo'lsa yoki u begona bo'lsa, userOrgId ni qaytaramiz.

    // Muhim: Agar requestedOrgId berilgan bo'lsa, biz uni tekshirishimiz kerak.
    // Hozirgi sodda mantiq: Agar ruxsati bo'lmagan ID so'ralsa, o'zinikiga qaytaramiz.
    if (!requestedOrgId) return userOrgId;

    // Bizda farzandlar ro'yxati bormi?
    const childrenIds = user.organization.children?.map((c: any) => c.id) || [];
    if (childrenIds.includes(requestedOrgId)) return requestedOrgId;

    return userOrgId;
  }

  // 3. Tuman darajasi (Faqat o'zini ko'ra oladi)
  return userOrgId;
};
