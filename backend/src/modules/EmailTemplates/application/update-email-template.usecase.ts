import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type { UpdateEmailTemplateInput, EmailTemplateEntity } from "../domain/email-template.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class UpdateEmailTemplateUseCase {
    constructor(
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateEmailTemplateInput,
        auditContext?: AuditContext
    ): Promise<EmailTemplateEntity> {
        try {
            const existing = await this.emailTemplatesRepository.findById(id);
            if (!existing) {
                throw new AppError("Email template not found", "EMAIL_TEMPLATE_NOT_FOUND", 404);
            }

            const updated = await this.emailTemplatesRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "email_templates",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    websiteId: updated.websiteId,
                    name: updated.name,
                    subject: updated.subject,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to update email template", "UPDATE_EMAIL_TEMPLATE_ERROR", 500);
        }
    }
}
