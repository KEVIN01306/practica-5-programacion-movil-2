import type {
    EmailTemplateEntity,
    CreateEmailTemplateInput,
    UpdateEmailTemplateInput,
    ListEmailTemplatesFilters,
} from "./email-template.entity.js";

export interface EmailTemplatesRepository {
    create(data: CreateEmailTemplateInput): Promise<EmailTemplateEntity>;
    findById(id: string): Promise<EmailTemplateEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListEmailTemplatesFilters;
    }): Promise<{ data: EmailTemplateEntity[]; total: number }>;
    update(id: string, data: UpdateEmailTemplateInput): Promise<EmailTemplateEntity>;
    delete(id: string): Promise<void>;
    countByWebsite(websiteId: string): Promise<number>;
}
