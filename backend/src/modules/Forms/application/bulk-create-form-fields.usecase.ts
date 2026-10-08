import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { FormsRepository } from "../domain/forms.repository.js";
import type { CreateFormFieldInput, FormFieldEntity } from "../domain/form-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class BulkCreateFormFieldsUseCase {
    constructor(
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly formsRepository: FormsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        formId: string,
        fields: Omit<CreateFormFieldInput, "formId">[],
        auditContext?: AuditContext
    ): Promise<FormFieldEntity[]> {
        const form = await this.formsRepository.findById(formId);
        if (!form) {
            throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
        }

        if (!fields || fields.length === 0) {
            throw new AppError("At least one field is required", "EMPTY_FIELDS_ARRAY", 400);
        }

        // Validate keys in payload
        const keySet = new Set<string>();
        for (const field of fields) {
            const key = field.key.trim().toLowerCase();
            if (!/^[a-z0-9_]+$/.test(key)) {
                throw new AppError(
                    `Invalid key format: '${key}'. Keys must contain only lowercase alphanumeric characters and underscores.`,
                    "INVALID_FIELD_KEY_FORMAT",
                    400
                );
            }
            if (keySet.has(key)) {
                throw new AppError(
                    `Duplicate key '${key}' found in fields payload.`,
                    "DUPLICATE_FIELD_KEY",
                    400
                );
            }
            keySet.add(key);

            const existing = await this.formFieldsRepository.findByKey(formId, key);
            if (existing) {
                throw new AppError(
                    `Field with key '${key}' already exists in this form.`,
                    "FIELD_ALREADY_EXISTS",
                    409
                );
            }
        }

        const createdFields = await this.formFieldsRepository.bulkCreate(formId, fields);

        await this.auditLogService.record({
            action: "CREATE",
            resource: "form_fields",
            resourceId: formId,
            userId: auditContext?.userId,
            context: auditContext,
            details: {
                formId,
                bulkCreatedCount: createdFields.length,
                keys: createdFields.map((f) => f.key),
            },
        });

        return createdFields;
    }
}
