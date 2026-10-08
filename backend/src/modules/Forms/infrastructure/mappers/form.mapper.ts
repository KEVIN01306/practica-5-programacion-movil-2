import type { Form as PrismaForm, EmailTemplate as PrismaEmailTemplate } from "@prisma/client";
import type { FormEntity } from "../../domain/form.entity.js";

type PrismaFormWithRelations = PrismaForm & {
    emailTemplate?: PrismaEmailTemplate | null;
    _count?: {
        fields?: number;
        submissions?: number;
    };
};

export class FormMapper {
    static toDomain(raw: PrismaFormWithRelations): FormEntity {
        let recipientEmails: string[] | null = null;
        if (Array.isArray(raw.recipientEmails)) {
            recipientEmails = raw.recipientEmails as string[];
        }

        return {
            id: raw.id,
            websiteId: raw.websiteId,
            name: raw.name,
            slug: raw.slug,
            sendEmail: raw.sendEmail,
            emailFrom: raw.emailFrom ?? null,
            recipientEmails,
            emailTemplateId: raw.emailTemplateId,
            emailTemplate: raw.emailTemplate
                ? {
                      id: raw.emailTemplate.id,
                      name: raw.emailTemplate.name,
                      subject: raw.emailTemplate.subject,
                  }
                : null,
            fieldsCount: raw._count?.fields,
            submissionsCount: raw._count?.submissions,
            createdAt: raw.createdAt,
            updatedAt: raw.updatedAt,
        };
    }
}
