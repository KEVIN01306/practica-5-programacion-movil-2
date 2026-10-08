import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { UpdateContentItemInput, ContentItemEntity } from "../domain/content-item.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class UpdateContentItemUseCase {
    constructor(
        private readonly contentItemsRepository: ContentItemsRepository,
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateContentItemInput,
        auditContext?: AuditContext
    ): Promise<ContentItemEntity> {
        try {
            const existing = await this.contentItemsRepository.findById(id);
            if (!existing) {
                throw new AppError("Content Item not found", "CONTENT_ITEM_NOT_FOUND", 404);
            }

            if (input.data) {
                const mergedData = { ...existing.data, ...input.data };
                const fields = await this.contentFieldsRepository.listByContentType(existing.contentTypeId);

                for (const field of fields) {
                    if (field.isRequired) {
                        const val = mergedData[field.key];
                        if (val === undefined || val === null || val === '') {
                            throw new AppError(
                                `Field "${field.name}" (${field.key}) is required`,
                                "REQUIRED_FIELD_MISSING",
                                400
                            );
                        }
                    }
                }
                input.data = mergedData;
            }

            const updated = await this.contentItemsRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "content_items",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    contentTypeId: updated.contentTypeId,
                    isPublished: updated.isPublished,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to update content item", "UPDATE_CONTENT_ITEM_ERROR", 500);
        }
    }
}
