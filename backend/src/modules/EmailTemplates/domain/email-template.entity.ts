export interface EmailTemplateEntity {
    id: string;
    websiteId: string;
    name: string;
    subject: string;
    htmlContent: string;
    formsCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateEmailTemplateInput {
    websiteId: string;
    name: string;
    subject: string;
    htmlContent: string;
}

export interface UpdateEmailTemplateInput {
    name?: string;
    subject?: string;
    htmlContent?: string;
}

export interface ListEmailTemplatesFilters {
    websiteId?: string;
    search?: string;
}
