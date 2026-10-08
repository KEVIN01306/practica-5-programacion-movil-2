import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { UpdateContentFieldInput, ContentFieldEntity } from "../domain/content-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

const VALID_FIELD_TYPES = ["STRING", "TEXT", "NUMBER", "BOOLEAN", "DATE", "JSON", "URL"] as const;

export class UpdateContentFieldUseCase {
    constructor(
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateContentFieldInput,
        auditContext?: AuditContext
    ): Promise<ContentFieldEntity> {
        try {
            const existing = await this.contentFieldsRepository.findById(id);
            if (!existing) {
                throw new AppError("Content Field not found", "CONTENT_FIELD_NOT_FOUND", 404);
            }

            if (input.type !== undefined && !VALID_FIELD_TYPES.includes(input.type as any)) {
                throw new AppError(
                    `Invalid field type: ${input.type}. Supported types: ${VALID_FIELD_TYPES.join(", ")}`,
                    "INVALID_FIELD_TYPE",
                    400
                );
            }

            if (input.key !== undefined) {
                const normalizedKey = input.key.toLowerCase().trim();
                if (normalizedKey !== existing.key) {
                    const keyExists = await this.contentFieldsRepository.findByKey(
                        existing.contentTypeId,
                        normalizedKey
                    );
                    if (keyExists && keyExists.id !== id) {
                        throw new AppError(
                            "A field with this key already exists in this Content Type",
                            "CONTENT_FIELD_KEY_ALREADY_EXISTS",
                            409
                        );
                    }
                }
            }

            const updated = await this.contentFieldsRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "content_fields",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    contentTypeId: updated.contentTypeId,
                    name: updated.name,
                    key: updated.key,
                    type: updated.type,
                    isRequired: updated.isRequired,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A field with this key already exists in this Content Type",
                    "CONTENT_FIELD_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to update content field", "UPDATE_CONTENT_FIELD_ERROR", 500);
        }
    }
}
