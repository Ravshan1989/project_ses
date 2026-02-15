import { UserRole } from "../enums/role.enum";

// UZ: Rol darajasini aniqlash (1 - Respublika, 2 - Viloyat, 3 - Tuman/Laboratoriya/Xodim)
// UZ: Rol darajasini aniqlash (1 - Respublika, 2 - Viloyat, 3 - Tuman/Laboratoriya/Xodim)
export const getRoleLevel = (role: UserRole, user?: any): number => {
  switch (role) {
    case UserRole.ADMIN:
      // UZ: Admin ham hamma narsani ko'ra oladi (Respublika darajasi bilan tenglashtiramiz)
      return 1;
    case UserRole.REPUBLIC_HEAD:
      return 1;
    case UserRole.REGION_HEAD:
      return 2;
    case UserRole.DEPARTMENT_HEAD:
      // UZ: Agar Mudir Viloyat darajasida bo'lsa (tashkilotining ota-onasi yo'q bo'lsa), u 2-daraja (Viloyat) hisoblanadi.
      // Agar Tuman darajasida bo'lsa (ota-onasi bor), u 3-daraja (Tuman).
      if (user && user.organization && !user.organization.parent) {
        return 2;
      }
      return 3;
    case UserRole.DISTRICT_HEAD:
    case UserRole.DISTRICT_SPECIALIST:
    case UserRole.DISTRICT_OPERATOR:
    case UserRole.LAB_HEAD:
    case UserRole.STAFF:
      return 3;
    default:
      return 3; // Default - eng past daraja
  }
};
