import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteContentItemUseCase {
    constructor(
        private readonly contentItemsRepository: ContentItemsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.contentItemsRepository.findById(id);
        if (!existing) {
            throw new AppError("Content Item not found", "CONTENT_ITEM_NOT_FOUND", 404);
        }

        await this.contentItemsRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "content_items",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                contentTypeId: existing.contentTypeId,
                isPublished: existing.isPublished,
            },
        });
    }
}
