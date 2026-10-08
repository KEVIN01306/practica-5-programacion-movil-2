import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { CreateContentFieldInput, ContentFieldEntity } from "../domain/content-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

const VALID_FIELD_TYPES = ["STRING", "TEXT", "NUMBER", "BOOLEAN", "DATE", "JSON", "URL"] as const;

export class CreateContentFieldUseCase {
    constructor(
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateContentFieldInput,
        auditContext?: AuditContext
    ): Promise<ContentFieldEntity> {
        try {
            // 1. Verify ContentType exists
            const contentType = await this.contentTypesRepository.findById(input.contentTypeId);
            if (!contentType) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }

            // 2. Validate Type
            if (!VALID_FIELD_TYPES.includes(input.type as any)) {
                throw new AppError(
                    `Invalid field type: ${input.type}. Supported types: ${VALID_FIELD_TYPES.join(", ")}`,
                    "INVALID_FIELD_TYPE",
                    400
                );
            }

            const normalizedKey = input.key.toLowerCase().trim();

            // 3. Validate Key uniqueness within ContentType
            const existingField = await this.contentFieldsRepository.findByKey(
                input.contentTypeId,
                normalizedKey
            );
            if (existingField) {
                throw new AppError(
                    "A field with this key already exists in this Content Type",
                    "CONTENT_FIELD_KEY_ALREADY_EXISTS",
                    409
                );
            }

            // 4. Create ContentField
            const field = await this.contentFieldsRepository.create({
                contentTypeId: input.contentTypeId,
                name: input.name.trim(),
                key: normalizedKey,
                type: input.type,
                isRequired: input.isRequired ?? false,
            });

            // 5. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "content_fields",
                resourceId: field.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: field,
                details: {
                    contentTypeId: field.contentTypeId,
                    contentTypeName: contentType.name,
                    name: field.name,
                    key: field.key,
                    type: field.type,
                    isRequired: field.isRequired,
                },
            });

            return field;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A field with this key already exists in this Content Type",
                    "CONTENT_FIELD_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to create content field", "CREATE_CONTENT_FIELD_ERROR", 500);
        }
    }
}
