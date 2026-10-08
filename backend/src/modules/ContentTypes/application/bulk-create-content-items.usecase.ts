import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentItemEntity } from "../domain/content-item.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export interface BulkCreateContentItemEntry {
    data: Record<string, any>;
    isPublished?: boolean;
}

export interface BulkCreateContentItemsInput {
    contentTypeId: string;
    items: BulkCreateContentItemEntry[];
}

export class BulkCreateContentItemsUseCase {
    constructor(
        private readonly contentItemsRepository: ContentItemsRepository,
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: BulkCreateContentItemsInput,
        auditContext?: AuditContext
    ): Promise<{ count: number; items: ContentItemEntity[] }> {
        try {
            if (!input.items || !Array.isArray(input.items) || input.items.length === 0) {
                throw new AppError("No items provided for bulk creation", "INVALID_BULK_ITEMS", 400);
            }

            // 1. Verify ContentType exists
            const contentType = await this.contentTypesRepository.findById(input.contentTypeId);
            if (!contentType) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }

            // 2. Fetch defined schema fields to validate required values
            const fields = await this.contentFieldsRepository.listByContentType(input.contentTypeId);

            // 3. Validate every item before inserting
            const preparedItems = input.items.map((entry, index) => {
                const itemData = entry.data || {};

                for (const field of fields) {
                    if (field.isRequired) {
                        const val = itemData[field.key];
                        if (val === undefined || val === null || val === '') {
                            throw new AppError(
                                `Item #${index + 1}: Required field "${field.name}" (${field.key}) is missing`,
                                "REQUIRED_FIELD_MISSING",
                                400
                            );
                        }
                    }
                }

                return {
                    contentTypeId: input.contentTypeId,
                    data: itemData,
                    isPublished: entry.isPublished ?? true,
                };
            });

            // 4. Create all items
            const created = await this.contentItemsRepository.createMany(preparedItems);

            // 5. Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "content_items",
                resourceId: contentType.id,
                userId: auditContext?.userId,
                context: auditContext,
                details: {
                    contentTypeId: contentType.id,
                    contentTypeName: contentType.name,
                    bulkCount: created.length,
                },
            });

            return {
                count: created.length,
                items: created,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to bulk create content items", "BULK_CREATE_ITEMS_ERROR", 500);
        }
    }
}
