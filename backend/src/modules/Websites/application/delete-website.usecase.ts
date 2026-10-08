import type { WebsitesRepository } from "../domain/websites.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteWebsiteUseCase {
    constructor(
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existingWebsite = await this.websitesRepository.findById(id);
        if (!existingWebsite) {
            throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
        }

        await this.websitesRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "websites",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existingWebsite,
            details: {
                name: existingWebsite.name,
                domain: existingWebsite.domain,
            },
        });
    }
}
