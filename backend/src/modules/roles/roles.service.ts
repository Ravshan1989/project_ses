import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Role } from "./entities/role.entity";
import { RolePermission } from "./entities/role-permission.entity";

@Injectable()
export class RolesService {
    constructor(
        @InjectRepository(Role)
        private readonly roleRepo: Repository<Role>,
        @InjectRepository(RolePermission)
        private readonly rolePermRepo: Repository<RolePermission>,
    ) { }

    async findAll() {
        return this.roleRepo.find({
            relations: ["rolePermissions"],
            order: { name: "ASC" },
        });
    }

    async findById(id: string) {
        return this.roleRepo.findOne({
            where: { id },
            relations: ["rolePermissions"],
        });
    }

    async create(data: Partial<Role>) {
        const role = this.roleRepo.create(data);
        return this.roleRepo.save(role);
    }

    async update(id: string, data: Partial<Role>) {
        await this.roleRepo.update(id, data);
        return this.findById(id);
    }

    async syncPermissions(roleId: string, permissions: any[]) {
        // UZ: Rol ruxsatlarini yangilash
        const role = await this.roleRepo.findOneBy({ id: roleId });
        if (!role) throw new Error("Role not found");

        // Eskilarini o'chirish
        await this.rolePermRepo.delete({ role: { id: roleId } });

        // Yangilarini qo'shish
        for (const p of permissions) {
            const rp = this.rolePermRepo.create({
                role,
                permissionCode: p.permissionCode,
                canView: p.canView || false,
                canEdit: p.canEdit || false,
                canDownload: p.canDownload || false,
            });
            await this.rolePermRepo.save(rp);
        }

        return { success: true };
    }
}
