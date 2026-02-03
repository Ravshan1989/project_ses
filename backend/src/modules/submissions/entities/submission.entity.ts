import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Template } from '../../forms/entities/template.entity';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { SubmissionStatus } from '../../../common/enums/status.enum';

@Entity('submissions')
export class Submission {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Template)
    @JoinColumn({ name: 'template_id' })
    template: Template;

    @ManyToOne(() => Organization, (org) => org.submissions)
    @JoinColumn({ name: 'organization_id' })
    organization: Organization;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'submitted_by_id' })
    submittedBy: User;

    @Column({ type: 'date' })
    reportingPeriod: string; // YYYY-MM-DD representing the period (e.g., 2024-02-01)

    // ACTUAL DATA
    // { "total_patients": 100, "recovered": 80 }
    @Column({ type: 'jsonb' })
    data: any;

    @Column({
        type: 'enum',
        enum: SubmissionStatus,
        default: SubmissionStatus.DRAFT
    })
    status: SubmissionStatus;

    @Column({ type: 'text', nullable: true })
    rejectionReason: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
