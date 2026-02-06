import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { PERMISSIONS_KEY } from "../../../common/decorators/permissions.decorator";
import { User } from "../../users/entities/user.entity";
import { UserRole } from "../../../common/enums/role.enum";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredPermission = this.reflector.getAllAndOverride<string>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (!requiredPermission) {
            return true; // No permission required
        }

        const { user } = context.switchToHttp().getRequest();

        // UZ: 1. QAT'IY QOIDA - Tuman darajasi (Level 3) uchun Forma 1 Table 2 & 3 ni har qanday holatda bloklash
        // Organization.parent bo'lsa - bu tuman darajasi (3)
        const isLevel3 = user?.organization?.parent != null;
        if (isLevel3 && (requiredPermission === "VIEW_FORM1_TABLE2" || requiredPermission === "VIEW_FORM1_TABLE3")) {
            throw new ForbiddenException("Tuman darajasida ushbu jadvallarga ruxsat berilmagan.");
        }

        // Admin access bypass (except for the strict level override above)
        if (user?.role === UserRole.ADMIN || user?.role === UserRole.REPUBLIC_HEAD) {
            return true;
        }

        if (!user || !user.department) {
            throw new ForbiddenException("Siz hech qanday bo'limga biriktirilmagansiz.");
        }

        // UZ: 2. Bo'lim ruxsatini tekshirish
        const hasDeptPermission = user.department.permissions?.some(
            (dp: any) => dp.permission?.code === requiredPermission
        );

        // UZ: 3. Dinamik Rol ruxsatini tekshirish (Yangi tizim)
        let hasRolePermission = false;
        if (user.dynamicRole && user.dynamicRole.rolePermissions) {
            hasRolePermission = user.dynamicRole.rolePermissions.some(
                (rp: any) => rp.permissionCode === requiredPermission && (rp.canView || rp.canEdit)
            );
        } else {
            // Agar dinamik rol biriktirilmagan bo'lsa, eski tizim (faqat bo'lim) bo'yicha ketadi
            hasRolePermission = true;
        }

        // UZ: 4. Shaxsiy (Individual) ruxsatni tekshirish
        let hasIndividualPermission = false;
        if (user.userPermissions) {
            hasIndividualPermission = user.userPermissions.some(
                (up: any) => up.permissionCode === requiredPermission && (up.canView || up.canEdit)
            );
        }

        // UZ: Kesishma (Intersection) - Bo'limda bo'lishi SHART, 
        // va (Rol'da bo'lishi kerak YOKI shaxsan berilgan bo'lishi kerak)
        if (!hasDeptPermission || (!hasRolePermission && !hasIndividualPermission)) {
            throw new ForbiddenException("Sizda ushbu ma'lumotni ko'rish huquqi yo'q.");
        }

        return true;
    }
}

