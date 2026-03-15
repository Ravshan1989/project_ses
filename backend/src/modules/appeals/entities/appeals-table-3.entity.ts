import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

@Entity("appeals_table_3")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable3 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    organization_id: string;

    @Column({ length: 7 })
    period_month: string;

    @Column()
    row_key: string; // District ID or 'total'

    @Column({ type: "int", default: 0 })
    total_prev: number;

    @Column({ type: "int", default: 0 })
    total_curr: number;

    @Column({ type: "int", default: 0 })
    phys_prev: number;

    @Column({ type: "int", default: 0 })
    phys_curr: number;

    @Column({ type: "int", default: 0 })
    legal_prev: number;

    @Column({ type: "int", default: 0 })
    legal_curr: number;

    @Column({ type: "int", default: 0 })
    written: number;

    @Column({ type: "int", default: 0 })
    electronic: number;

    @Column({ type: "int", default: 0 })
    oral_total: number;

    @Column({ type: "int", default: 0 })
    oral_leader_personal: number; // Col 12

    @Column({ type: "int", default: 0 })
    oral_leader_field: number; // Col 13

    @Column({ type: "int", default: 0 })
    oral_staff: number; // Col 14

    @Column({ type: "int", default: 0 })
    oral_phone: number; // Col 15

    @Column({ type: "int", default: 0 })
    ministry_routing: number;

    @Column({ type: "int", default: 0 })
    regional_routing: number;

    @Column({ type: "int", default: 0 })
    local_routing: number;

    @Column({ type: "int", default: 0 })
    being_considered: number;

    @Column({ type: "int", default: 0 })
    ministry_from_prev: number;

    @Column({ type: "int", default: 0 })
    ministry_from_curr: number;

    @Column({ type: "int", default: 0 })
    field_meetings_prev: number;

    @Column({ type: "int", default: 0 })
    field_meetings_curr: number;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
