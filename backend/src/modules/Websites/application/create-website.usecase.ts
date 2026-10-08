import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { CreateWebsiteInput, WebsiteEntity } from "../domain/website.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class CreateWebsiteUseCase {
    constructor(
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateWebsiteInput,
        auditContext?: AuditContext
    ): Promise<WebsiteEntity> {
        try {
            const normalizedDomain = input.domain.toLowerCase().trim();
            const existingWebsite = await this.websitesRepository.findByDomain(normalizedDomain);
            if (existingWebsite) {
                throw new AppError("A website with this domain already exists", "DOMAIN_ALREADY_EXISTS", 409);
            }

            const website = await this.websitesRepository.create({
                ...input,
                domain: normalizedDomain,
            });

            await this.auditLogService.record({
                action: "CREATE",
                resource: "websites",
                resourceId: website.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: website,
                details: {
                    name: website.name,
                    domain: website.domain,
                },
            });

            return website;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError("A website with this domain or API key already exists", "WEBSITE_CONFLICT", 409);
            }
            throw new AppError("Failed to create website", "CREATE_WEBSITE_ERROR", 500);
        }
    }
}
