import type { ContentFieldsRepository } from "../domain/content-fields.repository.js";
import type { ContentTypesRepository } from "../domain/content-types.repository.js";
import type { ContentFieldEntity, FieldType } from "../domain/content-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export interface BulkCreateContentFieldEntry {
    name: string;
    key: string;
    type: FieldType;
    isRequired?: boolean;
}

export interface BulkCreateContentFieldsInput {
    contentTypeId: string;
    fields: BulkCreateContentFieldEntry[];
}

export class BulkCreateContentFieldsUseCase {
    constructor(
        private readonly contentFieldsRepository: ContentFieldsRepository,
        private readonly contentTypesRepository: ContentTypesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: BulkCreateContentFieldsInput,
        auditContext?: AuditContext
    ): Promise<{ created: ContentFieldEntity[]; skipped: string[]; totalCreated: number }> {
        try {
            if (!input.fields || !Array.isArray(input.fields) || input.fields.length === 0) {
                throw new AppError("No fields provided for bulk creation", "INVALID_BULK_FIELDS", 400);
            }

            // 1. Verify ContentType exists
            const contentType = await this.contentTypesRepository.findById(input.contentTypeId);
            if (!contentType) {
                throw new AppError("Content Type not found", "CONTENT_TYPE_NOT_FOUND", 404);
            }

            // 2. Fetch existing fields to avoid duplicate key errors
            const existingFields = await this.contentFieldsRepository.listByContentType(input.contentTypeId);
            const existingKeySet = new Set(existingFields.map((f) => f.key.toLowerCase()));

            const VALID_TYPES: FieldType[] = ["STRING", "TEXT", "NUMBER", "BOOLEAN", "DATE", "JSON", "URL"];
            const created: ContentFieldEntity[] = [];
            const skipped: string[] = [];

            // 3. Process and insert each field
            for (const [i, entry] of input.fields.entries()) {
                if (!entry || !entry.name || !entry.key) {
                    throw new AppError(
                        `Field #${i + 1} is missing required 'name' or 'key'`,
                        "INVALID_FIELD_STRUCTURE",
                        400
                    );
                }

                const sanitizedKey = entry.key
                    .trim()
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "_");

                const fieldType = (entry.type ? entry.type.toUpperCase() : "STRING") as FieldType;
                if (!VALID_TYPES.includes(fieldType)) {
                    throw new AppError(
                        `Field '${entry.name}' has invalid type '${entry.type}'. Allowed types: ${VALID_TYPES.join(", ")}`,
                        "INVALID_FIELD_TYPE",
                        400
                    );
                }

                if (existingKeySet.has(sanitizedKey)) {
                    skipped.push(sanitizedKey);
                    continue;
                }

                const newField = await this.contentFieldsRepository.create({
                    contentTypeId: input.contentTypeId,
                    name: entry.name.trim(),
                    key: sanitizedKey,
                    type: fieldType,
                    isRequired: Boolean(entry.isRequired),
                });

                existingKeySet.add(sanitizedKey);
                created.push(newField);
            }

            // 4. Audit Log
            if (created.length > 0) {
                await this.auditLogService.record({
                    action: "CREATE",
                    resource: "content_fields",
                    resourceId: contentType.id,
                    userId: auditContext?.userId,
                    context: auditContext,
                    details: {
                        contentTypeId: contentType.id,
                        contentTypeName: contentType.name,
                        fieldsCreated: created.length,
                        fieldsSkipped: skipped.length,
                    },
                });
            }

            return {
                created,
                skipped,
                totalCreated: created.length,
            };
        } catch (error) {
            if (error instanceof AppError) throw error;
            console.error("BulkCreateContentFieldsUseCase error:", error);
            const message = error instanceof Error ? error.message : "Failed to bulk create content fields";
            throw new AppError(message, "BULK_CREATE_FIELDS_ERROR", 500);
        }
    }
}
