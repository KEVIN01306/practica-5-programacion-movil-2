import type {
    FormSubmissionEntity,
    CreateFormSubmissionInput,
    UpdateFormSubmissionStatusInput,
    ListFormSubmissionsFilters,
} from "./form-submission.entity.js";

export interface FormSubmissionsRepository {
    create(data: CreateFormSubmissionInput): Promise<FormSubmissionEntity>;
    findById(id: string): Promise<FormSubmissionEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListFormSubmissionsFilters;
    }): Promise<{ data: FormSubmissionEntity[]; total: number }>;
    updateStatus(id: string, data: UpdateFormSubmissionStatusInput): Promise<FormSubmissionEntity>;
    delete(id: string): Promise<void>;
    countByFormId(formId: string): Promise<number>;
}
