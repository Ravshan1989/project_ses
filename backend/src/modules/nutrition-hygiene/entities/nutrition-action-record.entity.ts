import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";

export enum NutritionEntryType {
    INSPECTION = "INSPECTION",
    LAB_SAMPLE = "LAB_SAMPLE",
}

export enum NutritionObjectType {
    PRODUCTION = "PRODUCTION",
    CATERING = "CATERING",
    TRADE = "TRADE",
    MARKET = "MARKET",
    ENT_SALT = "ENT_SALT",
    ENT_FLOUR = "ENT_FLOUR",
}

export enum NutritionMeasure {
    FINE = "FINE",
    SUSPENSION = "SUSPENSION",
    DISMISSAL_PROPOSAL = "DISMISSAL_PROPOSAL",
    DISMISSAL_ACTUAL = "DISMISSAL_ACTUAL",
    PROTOCOL = "PROTOCOL",
    STOP_OPERATION = "STOP_OPERATION",
    NONE = "NONE",
}

export enum LabResult {
    MEETS = "MEETS",
    NOT_MEETS = "NOT_MEETS",
    NOT_TESTED = "NOT_TESTED",
}

@Entity("nutrition_action_records")
export class NutritionActionRecord {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Organization)
    @JoinColumn({ name: "organization_id" })
    organization: Organization;

    @ManyToOne(() => User)
    @JoinColumn({ name: "created_by_id" })
    createdBy: User;

    @Column({ length: 7 })
    period_month: string; // YYYY-MM

    @Column({ type: "date" })
    action_date: string;

    @Column({
        type: "enum",
        enum: NutritionEntryType,
    })
    entry_type: NutritionEntryType;

    @Column({
        type: "enum",
        enum: NutritionObjectType,
    })
    object_type: NutritionObjectType;

    @Column({ type: "text", nullable: true })
    object_name: string;

    // Lab Related Fields
    @Column({ nullable: true })
    product_category: string; // Meat, Milk, Fish, etc.

    @Column({ type: "decimal", precision: 12, scale: 3, default: 0 })
    amount: number;

    @Column({
        type: "enum",
        enum: LabResult,
        default: LabResult.NOT_TESTED,
    })
    lab_result: LabResult;

    // Enforcement Related Fields
    @Column({ type: "boolean", default: false })
    violation_found: boolean;

    @Column({
        type: "enum",
        enum: NutritionMeasure,
        default: NutritionMeasure.NONE,
    })
    measure_type: NutritionMeasure;

    @Column({ type: "decimal", precision: 15, scale: 2, default: 0 })
    fine_sum: number;

    @Column({ type: "boolean", default: false })
    is_sent_to_court: boolean;

    @Column({ type: "boolean", default: false })
    is_sent_to_prosecutor: boolean;

    @Column({ type: "text", nullable: true })
    notes: string;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
