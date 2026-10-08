import type { FormFieldsRepository } from "../domain/form-fields.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteFormFieldUseCase {
    constructor(
        private readonly formFieldsRepository: FormFieldsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.formFieldsRepository.findById(id);
        if (!existing) {
            throw new AppError("Form field not found", "FORM_FIELD_NOT_FOUND", 404);
        }

        await this.formFieldsRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "form_fields",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                formId: existing.formId,
                label: existing.label,
                key: existing.key,
                type: existing.type,
            },
        });
    }
}
