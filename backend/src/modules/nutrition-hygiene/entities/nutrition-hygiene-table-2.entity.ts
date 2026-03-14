import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from "typeorm";

@Entity("nutrition_hygiene_table_2")
export class NutritionHygieneTable2 {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    organization_id: string;

    @Column()
    period_month: string;

    @Column()
    row_key: string;

    // Production
    @Column({ type: "int", default: 0 })
    prod_inspected_count: number;

    @Column({ type: "int", default: 0 })
    prod_medical_required: number;

    @Column({ type: "int", default: 0 })
    prod_medical_failed: number;

    // Catering
    @Column({ type: "int", default: 0 })
    cat_inspected_count: number;

    @Column({ type: "int", default: 0 })
    cat_medical_required: number;

    @Column({ type: "int", default: 0 })
    cat_medical_failed: number;

    // Trade
    @Column({ type: "int", default: 0 })
    trade_inspected_count: number;

    @Column({ type: "int", default: 0 })
    trade_medical_required: number;

    @Column({ type: "int", default: 0 })
    trade_medical_failed: number;

    // Measures
    @Column({ type: "int", default: 0 })
    dismissal_proposals: number;

    @Column({ type: "int", default: 0 })
    dismissed_employees: number;

    @Column({ type: "int", default: 0 })
    medical_checked_after_proposal: number;

    @Column({ type: "int", default: 0 })
    protocols_count: number;

    @CreateDateColumn()
    created_at: Date;

    @UpdateDateColumn()
    updated_at: Date;
}
