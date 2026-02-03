export enum SubmissionStatus {
    DRAFT = 'DRAFT',
    SUBMITTED = 'SUBMITTED',
    APPROVED = 'APPROVED',
    REJECTED = 'REJECTED'
}

export interface Organization {
    id: string;
    name: string;
}

export interface Template {
    id: string;
    name: string;
    schemaDefinition: Array<{
        key: string;
        label: string;
        type: 'number' | 'text' | 'date';
        required?: boolean;
    }>;
}

export interface Submission {
    id: string;
    template: Template;
    organization: Organization;
    reportingPeriod: string;
    status: SubmissionStatus;
    data: any;
    rejectionReason?: string;
    createdAt: string;
}
