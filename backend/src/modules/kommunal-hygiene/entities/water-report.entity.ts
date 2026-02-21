import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    Index
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';
import { ReportStatus } from '../../../common/enums/report-status.enum';

/**
 * Kommunal gigiyena: Ichimlik suvi bo'yicha oylik hisobot
 * row_type values: 
 *  'kommunal'          = Kommunal vodoprovodlar jami
 *  'kommunal_norm'     = Shundan sanitariya normalarga javob bermaydi
 *  'departmental'      = Idoraviy vodoprovod
 *  'departmental_norm' = Shundan sanitariya normalarga javob bermaydi
 */
@Entity('kg_water_reports')
@Unique(['reportMonth', 'organization', 'row_type'])
export class KgWaterReport {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ type: 'date' })
    reportMonth: string;

    @Index()
    @ManyToOne(() => Organization)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @Column()
    row_type: string;

    // ─── KIMYOVIY KO'RSATKICHLAR BO'YICHA ───────────────────────────────────
    @Column({ default: 0 }) chem_total: number; // Jami tekshirilgan namunalar
    @Column({ default: 0 }) chem_norm_bad: number; // Shundan sanitariya normalarga javob bermaydi (small col 1)

    // Shu jumladan tekshirilgan namunalar:
    @Column({ default: 0 }) chem_src_manba: number;    // Manbadan
    @Column({ default: 0 }) chem_src_tarmok_oldin: number; // Tarmokdan oldin
    @Column({ default: 0 }) chem_src_tarmok_point: number; // Tarmok kontrol nuqtalaridan
    @Column({ default: 0 }) chem_src_consumer: number; // Iste'molchidan

    // Talabga javob bermagan suv namunalar san ko'rsatkichlari bo'yicha kengaytmasi:
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_ammiak: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_nitrat: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_nitrit: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_qoldiq: number; // Quruq qoldiq
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_xlorid: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_sulfat: number;
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_loyqa: number;  // Loyqalanish
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_qattiq: number; // Um. qattiqlik
    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 }) chem_bad_other: number;

    // ─── CENTER COLUMN ───────────────────────────────────────────────────
    @Column({ default: 0 }) total_inspected_samples: number; // Jami tekshirilgan namunalar (Standalone)

    // ─── BAKTERIOLOGIYA LABORATORIYASI ──────────────────────────────────
    // Shu jumladan tekshirilgan namunalar:
    @Column({ default: 0 }) bact_src_manba: number;
    @Column({ default: 0 }) bact_src_tarmok_oldin: number;
    @Column({ default: 0 }) bact_src_tarmok_point: number;
    @Column({ default: 0 }) bact_src_consumer: number;

    // Talabga javob bermagan suv namunalar bak ko'rsatkichlari bo'yicha kengaytmasi:
    @Column({ default: 0 }) bact_bad_umc: number;
    @Column({ default: 0 }) bact_bad_koli: number;
    @Column({ default: 0 }) bact_bad_sfz: number;

    @Column({ default: 0 }) bact_norm_bad: number; // Shundan san normalariga javob bermaydi (Bakt)

    // ─── STATUS ──────────────────────────────────────────────────────────
    @Column({
        type: 'enum',
        enum: ReportStatus,
        default: ReportStatus.DRAFT,
    })
    status: ReportStatus;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
