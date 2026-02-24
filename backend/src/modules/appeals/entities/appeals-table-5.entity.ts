import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
} from "typeorm";

@Entity("appeals_table_5")
@Unique(["organization_id", "period_month", "row_key"])
export class AppealsTable5 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "uuid" })
    organization_id: string;

    @Column({ length: 7 })
    period_month: string;

    @Column()
    row_key: string;

    @Column({ type: "int", default: 0 })
    total_prev: number;

    @Column({ type: "int", default: 0 })
    total_curr: number;

    @Column({ type: "int", default: 0 })
    phys_total_prev: number;

    @Column({ type: "int", default: 0 })
    phys_total_curr: number;

    @Column({ type: "int", default: 0 })
    phys_ariza_prev: number;

    @Column({ type: "int", default: 0 })
    phys_ariza_curr: number;

    @Column({ type: "int", default: 0 })
    phys_shikoyat_prev: number;

    @Column({ type: "int", default: 0 })
    phys_shikoyat_curr: number;

    @Column({ type: "int", default: 0 })
    phys_taklif_prev: number;

    @Column({ type: "int", default: 0 })
    phys_taklif_curr: number;

    @Column({ type: "int", default: 0 })
    legal_total_prev: number;

    @Column({ type: "int", default: 0 })
    legal_total_curr: number;

    @Column({ type: "int", default: 0 })
    legal_ariza_prev: number;

    @Column({ type: "int", default: 0 })
    legal_ariza_curr: number;

    @Column({ type: "int", default: 0 })
    legal_shikoyat_prev: number;

    @Column({ type: "int", default: 0 })
    legal_shikoyat_curr: number;

    @Column({ type: "int", default: 0 })
    legal_taklif_prev: number;

    @Column({ type: "int", default: 0 })
    legal_taklif_curr: number;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
