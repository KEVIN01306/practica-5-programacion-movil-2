import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteEmailTemplateUseCase {
    constructor(
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.emailTemplatesRepository.findById(id);
        if (!existing) {
            throw new AppError("Email template not found", "EMAIL_TEMPLATE_NOT_FOUND", 404);
        }

        await this.emailTemplatesRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "email_templates",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                websiteId: existing.websiteId,
                name: existing.name,
                subject: existing.subject,
            },
        });
    }
}
