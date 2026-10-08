import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteContentTypeUseCase {
    constructor(
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.contentTypesRepository.findById(id);
        if (!existing) {
            throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
        }

        await this.contentTypesRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "content_types",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                websiteId: existing.websiteId,
                name: existing.name,
                slug: existing.slug,
            },
        });
    }
}
