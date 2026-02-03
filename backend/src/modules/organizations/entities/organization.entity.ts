import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Submission } from '../../submissions/entities/submission.entity';

@Entity('organizations')
export class Organization {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column({ type: 'int', default: 0 })
    population: number;

    // HIERARCHY: Region -> District
    // If parent is null, it is top level (i.e., Viloyat)
    @ManyToOne(() => Organization, (org) => org.children, { nullable: true })
    @JoinColumn({ name: 'parent_id' })
    parent: Organization;

    @OneToMany(() => Organization, (org) => org.parent)
    children: Organization[];

    @OneToMany(() => User, (user) => user.organization)
    users: User[];

    @OneToMany(() => Submission, (sub) => sub.organization)
    submissions: Submission[];
}
