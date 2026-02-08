import { UserRole } from "../enums/role.enum";

// UZ: Rol darajasini aniqlash (1 - Respublika, 2 - Viloyat, 3 - Tuman/Laboratoriya/Xodim)
export const getRoleLevel = (role: UserRole): number => {
  switch (role) {
    case UserRole.ADMIN:
      // UZ: Admin ham hamma narsani ko'ra oladi (Respublika darajasi bilan tenglashtiramiz)
      return 1;
    case UserRole.REPUBLIC_HEAD:
      return 1;
    case UserRole.REGION_HEAD:
      return 2;
    case UserRole.DISTRICT_HEAD:
    case UserRole.LAB_HEAD:
    case UserRole.STAFF:
      return 3;
    default:
      return 3; // Default - eng past daraja
  }
};
