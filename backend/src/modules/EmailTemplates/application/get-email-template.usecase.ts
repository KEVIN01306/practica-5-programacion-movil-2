import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type { EmailTemplateEntity } from "../domain/email-template.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetEmailTemplateUseCase {
    constructor(private readonly emailTemplatesRepository: EmailTemplatesRepository) {}

    async execute(id: string): Promise<EmailTemplateEntity> {
        const template = await this.emailTemplatesRepository.findById(id);
        if (!template) {
            throw new AppError("Email template not found", "EMAIL_TEMPLATE_NOT_FOUND", 404);
        }
        return template;
    }
}
