import type { EmailTemplatesRepository } from "../domain/email-templates.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { EmailTemplateEntity, ListEmailTemplatesFilters } from "../domain/email-template.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class ListEmailTemplatesUseCase {
    constructor(
        private readonly emailTemplatesRepository: EmailTemplatesRepository,
        private readonly websitesRepository: WebsitesRepository
    ) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListEmailTemplatesFilters;
    }): Promise<{ data: EmailTemplateEntity[]; total: number }> {
        if (params.filters?.websiteId) {
            const website = await this.websitesRepository.findById(params.filters.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }
        }

        return await this.emailTemplatesRepository.list(params);
    }
}
