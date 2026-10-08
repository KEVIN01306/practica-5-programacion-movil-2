import type { FormsRepository } from "../domain/forms.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { EmailTemplatesRepository } from "../../EmailTemplates/domain/email-templates.repository.js";
import type { CreateFormInput, FormEntity } from "../domain/form.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class CreateFormUseCase {
    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly websitesRepository: WebsitesRepository,
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(input: CreateFormInput, auditContext?: AuditContext): Promise<FormEntity> {
        try {
            // 1. Verify Website exists
            const website = await this.websitesRepository.findById(input.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            const normalizedSlug = input.slug.toLowerCase().trim();

            // 2. Validate slug uniqueness within website
            const existingForm = await this.formsRepository.findBySlug(
                input.websiteId,
                normalizedSlug
            );
            if (existingForm) {
                throw new AppError(
                    "A Form with this slug already exists for this website",
                    "FORM_SLUG_ALREADY_EXISTS",
                    409
                );
            }

            // 3. If email template is provided, verify it belongs to the same website
            if (input.emailTemplateId) {
                const template = await this.emailTemplatesRepository.findById(input.emailTemplateId);
                if (!template || template.websiteId !== input.websiteId) {
                    throw new AppError(
                        "The selected email template does not exist or does not belong to this website",
                        "INVALID_EMAIL_TEMPLATE",
                        400
                    );
                }
            }

            // 4. Validate recipientEmails if sendEmail is true
            if (input.sendEmail && (!input.recipientEmails || input.recipientEmails.length === 0)) {
                throw new AppError(
                    "At least one recipient email address is required when email notifications are enabled",
                    "RECIPIENT_EMAILS_REQUIRED",
                    400
                );
            }

            // 5. Format sender email locked to the website's domain
            let formattedEmailFrom: string | null = null;
            if (input.emailFrom && input.emailFrom.trim()) {
                const rawSender = input.emailFrom.trim().toLowerCase();
                const [userPartRaw] = rawSender.split("@");
                const userPart = userPartRaw?.trim() || rawSender;
                if (userPart) {
                    formattedEmailFrom = `${userPart}@${website.domain.toLowerCase().trim()}`;
                }
            } else if (input.sendEmail) {
                formattedEmailFrom = `notifications@${website.domain.toLowerCase().trim()}`;
            }

            // 6. Create Form
            const form = await this.formsRepository.create({
                websiteId: input.websiteId,
                name: input.name.trim(),
                slug: normalizedSlug,
                sendEmail: input.sendEmail ?? false,
                emailFrom: formattedEmailFrom,
                recipientEmails: input.recipientEmails || null,
                emailTemplateId: input.emailTemplateId || null,
            });

            // 7. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "forms",
                resourceId: form.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: form,
                details: {
                    websiteId: form.websiteId,
                    name: form.name,
                    slug: form.slug,
                },
            });

            return form;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A Form with this slug already exists for this website",
                    "FORM_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to create form", "CREATE_FORM_ERROR", 500);
        }
    }
}
