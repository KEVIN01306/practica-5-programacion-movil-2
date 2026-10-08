import type { SubmissionStatus } from "@prisma/client";

export interface FormSubmissionEntity {
    id: string;
    formId: string;
    contactId: string | null;
    data: Record<string, any>;
    status: SubmissionStatus;
    createdAt: Date;
    contact?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        phone: string | null;
    } | null;
    form?: {
        id: string;
        name: string;
        slug: string;
        websiteId: string;
    };
}

export interface CreateFormSubmissionInput {
    formId: string;
    contactId?: string | null;
    data: Record<string, any>;
    status?: SubmissionStatus;
}

export interface UpdateFormSubmissionStatusInput {
    status: SubmissionStatus;
}

export interface ListFormSubmissionsFilters {
    formId?: string;
    websiteId?: string;
    status?: SubmissionStatus;
    search?: string;
}
