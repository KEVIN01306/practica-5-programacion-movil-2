import type { ContactStatus } from "@prisma/client";
export type { ContactStatus };

export interface ContactSubmissionSummary {
    id: string;
    formId: string;
    formName?: string;
    formSlug?: string;
    data: Record<string, any>;
    status: "PENDING" | "PROCESSED" | "SPAM" | "FAILED";
    createdAt: Date;
}

export interface ContactEntity {
    id: string;
    websiteId: string;
    website?: {
        id: string;
        name: string;
        domain: string;
    } | null;
    email: string;
    firstName: string | null;
    lastName: string | null;
    phone: string | null;
    company: string | null;
    status: ContactStatus;
    customData: Record<string, any> | null;
    tags: string[] | null;
    submissionsCount?: number;
    submissions?: ContactSubmissionSummary[];
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateContactInput {
    websiteId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    company?: string | null;
    status?: ContactStatus;
    customData?: Record<string, any> | null;
    tags?: string[] | null;
}

export interface UpdateContactInput {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    company?: string | null;
    status?: ContactStatus;
    customData?: Record<string, any> | null;
    tags?: string[] | null;
}

export interface ListContactsFilters {
    websiteId?: string;
    search?: string;
    status?: ContactStatus;
}
