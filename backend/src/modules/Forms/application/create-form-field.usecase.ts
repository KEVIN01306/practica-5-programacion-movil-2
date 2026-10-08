import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { FormsRepository } from "../domain/forms.repository.js";
import type { CreateFormFieldInput, FormFieldEntity } from "../domain/form-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class CreateFormFieldUseCase {
    constructor(
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly formsRepository: FormsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        input: CreateFormFieldInput,
        auditContext?: AuditContext
    ): Promise<FormFieldEntity> {
        try {
            // 1. Verify Form exists
            const form = await this.formsRepository.findById(input.formId);
            if (!form) {
                throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
            }

            const normalizedKey = input.key.trim().toLowerCase();

            // 2. Validate key format
            if (!/^[a-z0-9_]+$/.test(normalizedKey)) {
                throw new AppError(
                    "Field key must contain only lowercase alphanumeric characters and underscores (e.g. contact_email)",
                    "INVALID_FIELD_KEY_FORMAT",
                    400
                );
            }

            // 3. Validate key uniqueness within Form
            const existingField = await this.formFieldsRepository.findByKey(
                input.formId,
                normalizedKey
            );
            if (existingField) {
                throw new AppError(
                    "A field with this key already exists for this form",
                    "FORM_FIELD_KEY_ALREADY_EXISTS",
                    409
                );
            }

            // 4. Create field
            const field = await this.formFieldsRepository.create({
                formId: input.formId,
                label: input.label.trim(),
                key: normalizedKey,
                type: input.type,
                isRequired: input.isRequired ?? false,
            });

            // 5. Record Audit Log
            await this.auditLogService.record({
                action: "CREATE",
                resource: "form_fields",
                resourceId: field.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: field,
                details: {
                    formId: field.formId,
                    label: field.label,
                    key: field.key,
                    type: field.type,
                },
            });

            return field;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A field with this key already exists for this form",
                    "FORM_FIELD_KEY_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to create form field", "CREATE_FORM_FIELD_ERROR", 500);
        }
    }
}
