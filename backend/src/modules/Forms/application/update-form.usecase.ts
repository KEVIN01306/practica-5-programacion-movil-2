import type { FormsRepository } from "../domain/forms.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { EmailTemplatesRepository } from "../../EmailTemplates/domain/email-templates.repository.js";
import type { UpdateFormInput, FormEntity } from "../domain/form.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class UpdateFormUseCase {
    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly websitesRepository: WebsitesRepository,
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly auditLogService: AuditLogService
    ) { }

    async execute(
        id: string,
        input: UpdateFormInput,
        auditContext?: AuditContext
    ): Promise<FormEntity> {
        try {
            const existing = await this.formsRepository.findById(id);
            if (!existing) {
                throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
            }

            const website = await this.websitesRepository.findById(existing.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            // If slug changed, validate uniqueness
            if (input.slug !== undefined) {
                const normalizedSlug = input.slug.toLowerCase().trim();
                if (normalizedSlug !== existing.slug) {
                    const slugExists = await this.formsRepository.findBySlug(
                        existing.websiteId,
                        normalizedSlug
                    );
                    if (slugExists && slugExists.id !== id) {
                        throw new AppError(
                            "A Form with this slug already exists for this website",
                            "FORM_SLUG_ALREADY_EXISTS",
                            409
                        );
                    }
                }
            }

            // If emailTemplateId changed and is provided, verify it belongs to same website
            if (input.emailTemplateId) {
                const template = await this.emailTemplatesRepository.findById(input.emailTemplateId);
                if (!template || template.websiteId !== existing.websiteId) {
                    throw new AppError(
                        "The selected email template does not exist or does not belong to this website",
                        "INVALID_EMAIL_TEMPLATE",
                        400
                    );
                }
            }

            const sendEmail = input.sendEmail !== undefined ? input.sendEmail : existing.sendEmail;
            const recipientEmails =
                input.recipientEmails !== undefined ? input.recipientEmails : existing.recipientEmails;

            if (sendEmail && (!recipientEmails || recipientEmails.length === 0)) {
                throw new AppError(
                    "At least one recipient email address is required when email notifications are enabled",
                    "RECIPIENT_EMAILS_REQUIRED",
                    400
                );
            }

            const updatePayload: UpdateFormInput = { ...input };

            if (input.emailFrom !== undefined) {
                if (input.emailFrom && input.emailFrom.trim()) {
                    const rawSender = input.emailFrom.trim().toLowerCase();
                    const [userPartRaw] = rawSender.split("@");
                    const userPart = userPartRaw?.trim() || rawSender;
                    updatePayload.emailFrom = userPart ? `${userPart}@${website.domain.toLowerCase().trim()}` : null;
                } else {
                    updatePayload.emailFrom = null;
                }
            }

            const updated = await this.formsRepository.update(id, updatePayload);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "forms",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    websiteId: updated.websiteId,
                    name: updated.name,
                    slug: updated.slug,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A Form with this slug already exists for this website",
                    "FORM_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to update form", "UPDATE_FORM_ERROR", 500);
        }
    }
}
