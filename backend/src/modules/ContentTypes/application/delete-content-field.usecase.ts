import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteContentFieldUseCase {
    constructor(
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.contentFieldsRepository.findById(id);
        if (!existing) {
            throw new AppError("Content Field not found", "CONTENT_FIELD_NOT_FOUND", 404);
        }

        await this.contentFieldsRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "content_fields",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                contentTypeId: existing.contentTypeId,
                name: existing.name,
                key: existing.key,
                type: existing.type,
            },
        });
    }
}
