import { randomUUID } from "node:crypto";
import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { WebsiteEntity } from "../domain/website.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class RegenerateApiKeyUseCase {
    constructor(
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<WebsiteEntity> {
        const existingWebsite = await this.websitesRepository.findById(id);
        if (!existingWebsite) {
            throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
        }

        const newApiKey = randomUUID();
        const updatedWebsite = await this.websitesRepository.regenerateApiKey(id, newApiKey);

        await this.auditLogService.record({
            action: "UPDATE",
            resource: "websites",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            details: {
                name: updatedWebsite.name,
                domain: updatedWebsite.domain,
                event: "REGENERATE_API_KEY",
            },
        });

        return updatedWebsite;
    }
}
