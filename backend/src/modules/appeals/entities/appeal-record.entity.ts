import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
} from "typeorm";
import { Organization } from "../../organizations/entities/organization.entity";
import { User } from "../../users/entities/user.entity";

export enum ApplicantType {
    PHYSICAL = "PHYSICAL",
    LEGAL = "LEGAL",
}

export enum AppealType {
    ARIZA = "ARIZA",
    SHIKOYAT = "SHIKOYAT",
    TAKLIF = "TAKLIF",
}

export enum AppealChannel {
    ORAL = "ORAL",
    WRITTEN = "WRITTEN",
    ELECTRONIC = "ELECTRONIC",
    VIRTUAL_RECEPTION = "VIRTUAL_RECEPTION",
    PEOPLES_RECEPTION = "PEOPLES_RECEPTION",
}

export enum AppealStatus {
    SATISFIED = "SATISFIED",
    EXPLAINED = "EXPLAINED",
    ROUTED = "ROUTED",
    REJECTED = "REJECTED",
    BEING_CONSIDERED = "BEING_CONSIDERED",
}

export enum DisciplinaryMeasure {
    FINE = "FINE",
    REPRIMAND = "REPRIMAND",
    DISMISSAL = "DISMISSAL",
    ADMINISTRATIVE = "ADMINISTRATIVE",
    CRIMINAL = "CRIMINAL",
    NONE = "NONE",
}

@Entity("appeal_records")
export class AppealRecord {
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
    registration_date: string;

    @Column({ type: "text" })
    applicant_name: string;

    @Column({
        type: "enum",
        enum: ApplicantType,
    })
    applicant_type: ApplicantType;

    @Column({
        type: "enum",
        enum: AppealType,
    })
    appeal_type: AppealType;

    @Column({
        type: "enum",
        enum: AppealChannel,
    })
    channel: AppealChannel;

    @Column({
        type: "enum",
        enum: AppealStatus,
        default: AppealStatus.BEING_CONSIDERED,
    })
    status: AppealStatus;

    @Column({
        type: "enum",
        enum: DisciplinaryMeasure,
        default: DisciplinaryMeasure.NONE,
    })
    consequence: DisciplinaryMeasure;

    @Column({ nullable: true })
    recipient: string; // e.g., 'head', 'deputy_epid', 'deputy_san' for Table 1

    @Column({ nullable: true })
    subject_key: string; // e.g., 'san_epid', 'coronavirus' for Table 4

    @Column({ type: "text", nullable: true })

    summary: string;

    @Column({ default: false })
    is_repeated: boolean;

    @Column({ default: false })
    is_overdue: boolean;

    @Column({ default: false })
    is_phone: boolean;

    @Column({ default: false })
    is_field_meeting: boolean;

    @Column({ type: "date", nullable: true })
    deadline_date: string;

    @Column({ type: "date", nullable: true })
    closure_date: string;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "responsible_user_id" })
    responsibleUser: User;

    @CreateDateColumn({ type: "timestamp with time zone" })
    created_at: Date;

    @UpdateDateColumn({ type: "timestamp with time zone" })
    updated_at: Date;
}
