import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteFormSubmissionUseCase {
    constructor(
        private readonly formSubmissionsRepository: FormSubmissionsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.formSubmissionsRepository.findById(id);
        if (!existing) {
            throw new AppError("Form submission not found", "SUBMISSION_NOT_FOUND", 404);
        }

        await this.formSubmissionsRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "form_submissions",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                formId: existing.formId,
                status: existing.status,
            },
        });
    }
}
