import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';

export enum WorkflowAction {
    SUBMIT = 'SUBMIT',
    APPROVE = 'APPROVE',
    REJECT = 'REJECT'
}

export class UpdateStatusDto {
    @IsEnum(WorkflowAction)
    @IsNotEmpty()
    action: WorkflowAction;

    @IsString()
    @IsOptional()
    comment?: string;
}
