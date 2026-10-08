import type { ContentItemsRepository } from "../domain/content-items.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { CreateContentItemInput, ContentItemEntity } from "../domain/content-item.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class CreateContentItemUseCase {
    constructor(
        private readonly contentItemsRepository: ContentItemsRepository,
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateContentItemInput,
        auditContext?: AuditContext
    ): Promise<ContentItemEntity> {
        try {
            // 1. Verify ContentType exists
            const contentType = await this.contentTypesRepository.findById(input.contentTypeId);
            if (!contentType) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }

            // 2. Fetch defined schema fields to validate required values
            const fields = await this.contentFieldsRepository.listByContentType(input.contentTypeId);
            const data = input.data || {};

            for (const field of fields) {
                if (field.isRequired) {
                    const val = data[field.key];
                    if (val === undefined || val === null || val === '') {
                        throw new AppError(
                            `Field "${field.name}" (${field.key}) is required`,
                            "REQUIRED_FIELD_MISSING",
                            400
                        );
                    }
                }
            }

            // 3. Create ContentItem
            const item = await this.contentItemsRepository.create({
                contentTypeId: input.contentTypeId,
                data,
                isPublished: input.isPublished ?? true,
            });

            // 4. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "content_items",
                resourceId: item.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: item,
                details: {
                    contentTypeId: item.contentTypeId,
                    contentTypeName: contentType.name,
                    isPublished: item.isPublished,
                },
            });

            return item;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to create content item", "CREATE_CONTENT_ITEM_ERROR", 500);
        }
    }
}
