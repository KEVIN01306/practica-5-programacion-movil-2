import type { FormSubmissionsRepository } from "../domain/form-submissions.repository.js";
import type { FormSubmissionEntity, UpdateFormSubmissionStatusInput } from "../domain/form-submission.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class UpdateFormSubmissionStatusUseCase {
    constructor(
        private readonly formSubmissionsRepository: FormSubmissionsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateFormSubmissionStatusInput,
        auditContext?: AuditContext
    ): Promise<FormSubmissionEntity> {
        const existing = await this.formSubmissionsRepository.findById(id);
        if (!existing) {
            throw new AppError("Form submission not found", "SUBMISSION_NOT_FOUND", 404);
        }

        const updated = await this.formSubmissionsRepository.updateStatus(id, input);

        await this.auditLogService.record({
            action: "UPDATE",
            resource: "form_submissions",
            resourceId: updated.id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            after: updated,
            details: {
                formId: updated.formId,
                status: updated.status,
            },
        });

        return updated;
    }
}
