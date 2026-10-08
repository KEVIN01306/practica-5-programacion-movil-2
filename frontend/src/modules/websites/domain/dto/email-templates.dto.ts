export interface EmailTemplateDto {
    id: string;
    websiteId: string;
    name: string;
    subject: string;
    htmlContent: string;
    formsCount?: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateEmailTemplateDto {
    websiteId?: string;
    name: string;
    subject: string;
    htmlContent: string;
}

export interface UpdateEmailTemplateDto {
    name?: string;
    subject?: string;
    htmlContent?: string;
}
