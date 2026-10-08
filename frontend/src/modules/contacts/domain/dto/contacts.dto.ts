export type ContactStatusDto = 'LEAD' | 'ACTIVE' | 'UNSUBSCRIBED' | 'ARCHIVED';

export interface ContactSubmissionSummaryDto {
    id: string;
    formId: string;
    form?: {
        id: string;
        name: string;
        slug: string;
    } | null;
    formName?: string;
    formSlug?: string;
    data: Record<string, any>;
    status: 'PENDING' | 'PROCESSED' | 'SPAM' | 'FAILED';
    ipAddress?: string | null;
    userAgent?: string | null;
    createdAt: string;
}

export interface ContactDto {
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
    status: ContactStatusDto;
    customData: Record<string, any> | null;
    tags: string[] | null;
    submissionsCount?: number;
    submissions?: ContactSubmissionSummaryDto[];
    createdAt: string;
    updatedAt: string;
}

export interface CreateContactDto {
    websiteId: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    company?: string | null;
    status?: ContactStatusDto;
    customData?: Record<string, any> | null;
    tags?: string[] | null;
}

export interface UpdateContactDto {
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    company?: string | null;
    status?: ContactStatusDto;
    customData?: Record<string, any> | null;
    tags?: string[] | null;
}

export interface ListContactsParamsDto {
    page?: number;
    limit?: number;
    search?: string;
    websiteId?: string;
    status?: ContactStatusDto;
}

export interface ContactsListResponseDto {
    data: ContactDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
