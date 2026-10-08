import type { FormsRepository } from "../domain/forms.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteFormUseCase {
    constructor(
        private readonly formsRepository: FormsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        const existing = await this.formsRepository.findById(id);
        if (!existing) {
            throw new AppError("Form not found", "FORM_NOT_FOUND", 404);
        }

        await this.formsRepository.delete(id);

        await this.auditLogService.record({
            action: "DELETE",
            resource: "forms",
            resourceId: id,
            userId: auditContext?.userId,
            context: auditContext,
            before: existing,
            details: {
                websiteId: existing.websiteId,
                name: existing.name,
                slug: existing.slug,
            },
        });
    }
}
