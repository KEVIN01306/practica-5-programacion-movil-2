import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class DeleteContactUseCase {
    constructor(
        private readonly contactsRepository: ContactsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(id: string, auditContext?: AuditContext): Promise<void> {
        try {
            const existing = await this.contactsRepository.findById(id);
            if (!existing) {
                throw new AppError("Contact not found", "CONTACT_NOT_FOUND", 404);
            }

            await this.contactsRepository.delete(id);

            await this.auditLogService.record({
                action: "DELETE",
                resource: "contacts",
                resourceId: existing.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                details: {
                    websiteId: existing.websiteId,
                    email: existing.email,
                },
            });
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to delete contact", "DELETE_CONTACT_ERROR", 500);
        }
    }
}
