import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { UpdateFormFieldInput, FormFieldEntity } from "../domain/form-field.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class UpdateFormFieldUseCase {
    constructor(
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateFormFieldInput,
        auditContext?: AuditContext
    ): Promise<FormFieldEntity> {
        try {
            const existing = await this.formFieldsRepository.findById(id);
            if (!existing) {
                throw new AppError("Form field not found", "FORM_FIELD_NOT_FOUND", 404);
            }

            if (input.key !== undefined) {
                const normalizedKey = input.key.trim().toLowerCase();
                if (!/^[a-z0-9_]+$/.test(normalizedKey)) {
                    throw new AppError(
                        "Field key must contain only lowercase alphanumeric characters and underscores (e.g. contact_email)",
                        "INVALID_FIELD_KEY_FORMAT",
                        400
                    );
                }

                if (normalizedKey !== existing.key) {
                    const keyExists = await this.formFieldsRepository.findByKey(
                        existing.formId,
                        normalizedKey
                    );
                    if (keyExists && keyExists.id !== id) {
                        throw new AppError(
                            "A field with this key already exists for this form",
                            "FORM_FIELD_KEY_ALREADY_EXISTS",
                            409
                        );
                    }
                }
            }

            const updated = await this.formFieldsRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "form_fields",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    formId: updated.formId,
                    label: updated.label,
                    key: updated.key,
                    type: updated.type,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A field with this key already exists for this form",
                    "FORM_FIELD_KEY_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to update form field", "UPDATE_FORM_FIELD_ERROR", 500);
        }
    }
}
