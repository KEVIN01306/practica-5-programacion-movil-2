import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { UpdateWebsiteInput, WebsiteEntity } from "../domain/website.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class UpdateWebsiteUseCase {
    constructor(
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateWebsiteInput,
        auditContext?: AuditContext
    ): Promise<WebsiteEntity> {
        try {
            const existingWebsite = await this.websitesRepository.findById(id);
            if (!existingWebsite) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            if (input.domain) {
                const normalizedDomain = input.domain.toLowerCase().trim();
                const domainConflict = await this.websitesRepository.findByDomain(normalizedDomain);
                if (domainConflict && domainConflict.id !== id) {
                    throw new AppError("A website with this domain already exists", "DOMAIN_ALREADY_EXISTS", 409);
                }
                input.domain = normalizedDomain;
            }

            const updatedWebsite = await this.websitesRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "websites",
                resourceId: id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existingWebsite,
                after: updatedWebsite,
                details: {
                    name: updatedWebsite.name,
                    domain: updatedWebsite.domain,
                },
            });

            return updatedWebsite;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A website with this domain or API key already exists", "WEBSITE_CONFLICT", 409);
            }
            throw new AppError("Failed to update website", "UPDATE_WEBSITE_ERROR", 500);
        }
    }
}
