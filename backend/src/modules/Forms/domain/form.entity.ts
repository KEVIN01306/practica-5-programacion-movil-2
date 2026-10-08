export interface FormEntity {
    id: string;
    websiteId: string;
    name: string;
    slug: string;
    sendEmail: boolean;
    emailFrom?: string | null;
    recipientEmails: string[] | null;
    emailTemplateId: string | null;
    emailTemplate?: {
        id: string;
        name: string;
        subject: string;
    } | null;
    fieldsCount?: number;
    submissionsCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateFormInput {
    websiteId: string;
    name: string;
    slug: string;
    sendEmail?: boolean;
    emailFrom?: string | null;
    recipientEmails?: string[] | null;
    emailTemplateId?: string | null;
}

export interface UpdateFormInput {
    name?: string;
    slug?: string;
    sendEmail?: boolean;
    emailFrom?: string | null;
    recipientEmails?: string[] | null;
    emailTemplateId?: string | null;
}

export interface ListFormsFilters {
    websiteId?: string;
    search?: string;
}
