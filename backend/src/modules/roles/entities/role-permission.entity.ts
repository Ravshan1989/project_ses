import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Role } from "./role.entity";

@Entity("role_permissions")
export class RolePermission {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "role_id" })
  role: Role;

  @Column()
  permissionCode: string; // UZ: Ruxsat kodi (VIEW_HEPATITIS, VIEW_FORM1_TABLE1 va h.k.)

  @Column({ default: false })
  canView: boolean;

  @Column({ default: false })
  canEdit: boolean;

  @Column({ default: false })
  canDownload: boolean; // UZ: Excelga yuklab olish huquqi
}
