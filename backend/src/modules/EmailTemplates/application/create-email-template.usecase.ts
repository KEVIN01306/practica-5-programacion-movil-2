import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { CreateEmailTemplateInput, EmailTemplateEntity } from "../domain/email-template.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class CreateEmailTemplateUseCase {
    constructor(
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateEmailTemplateInput,
        auditContext?: AuditContext
    ): Promise<EmailTemplateEntity> {
        try {
            // 1. Verify Website exists
            const website = await this.websitesRepository.findById(input.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            // 2. Create EmailTemplate
            const emailTemplate = await this.emailTemplatesRepository.create({
                websiteId: input.websiteId,
                name: input.name.trim(),
                subject: input.subject.trim(),
                htmlContent: input.htmlContent,
            });

            // 3. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "email_templates",
                resourceId: emailTemplate.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: emailTemplate,
                details: {
                    websiteId: emailTemplate.websiteId,
                    name: emailTemplate.name,
                    subject: emailTemplate.subject,
                },
            });

            return emailTemplate;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to create email template", "CREATE_EMAIL_TEMPLATE_ERROR", 500);
        }
    }
}
