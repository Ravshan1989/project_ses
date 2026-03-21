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
    case UserRole.HR:
    case UserRole.DEPARTMENT_HEAD:
      // UZ: Agar Kadr yoki Mudir Viloyat darajasida bo'lsa (tashkilotining ota-onasi Respublika bo'lsa), u 2-daraja.
      if (user && user.organization && user.organization.parent) {
        // Agar ota-onasining ham ota-onasi bo'lsa, demak bu tuman (Level 3)
        // Agar ota-onasining ota-onasi bo'lmasa, demak bu viloyat (Level 2)
        if (
          user.organization.parent.parent ||
          user.organization.parent.parent_id
        ) {
          return 3;
        }
        return 2;
      }
      // Agar ota-onasi bo'lmasa, demak bu Respublika (Level 1)
      if (
        user &&
        user.organization &&
        !user.organization.parent &&
        !user.organization.parent_id
      ) {
        return 1;
      }
      return 2; // Default viloyat deb hisoblaymiz (xavfsizlik uchun)
    case UserRole.DISTRICT_HEAD:
    case UserRole.DISTRICT_SPECIALIST:
    case UserRole.DISTRICT_OPERATOR:
    case UserRole.SANITARY_HEAD:
    case UserRole.SANITARY_SPECIALIST:
    case UserRole.SANITARY_OPERATOR:
    case UserRole.LEAD_SPECIALIST:
    case UserRole.LAB_HEAD:
    case UserRole.STAFF:
      return 3;
    default:
      return 3; // Default - eng past daraja
  }
};
