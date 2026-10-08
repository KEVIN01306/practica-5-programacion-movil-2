import type { EmailTemplate as PrismaEmailTemplate } from "@prisma/client";
import type { EmailTemplateEntity } from "../../domain/email-template.entity.js";

type PrismaEmailTemplateWithRelations = PrismaEmailTemplate & {
    _count?: {
        forms?: number;
    };
};

export class EmailTemplateMapper {
    static toDomain(raw: PrismaEmailTemplateWithRelations): EmailTemplateEntity {
        return {
            id: raw.id,
            websiteId: raw.websiteId,
            name: raw.name,
            subject: raw.subject,
            htmlContent: raw.htmlContent,
            formsCount: raw._count?.forms,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
