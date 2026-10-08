import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { ContactEntity, UpdateContactInput } from "../domain/contact.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class UpdateContactUseCase {
    constructor(
        private readonly contactsRepository: ContactsRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(
        id: string,
        input: UpdateContactInput,
        auditContext?: AuditContext
    ): Promise<ContactEntity> {
        try {
            const existing = await this.contactsRepository.findById(id);
            if (!existing) {
                throw new AppError("Contact not found", "CONTACT_NOT_FOUND", 404);
            }

            const updated = await this.contactsRepository.update(id, input);

            await this.auditLogService.record({
                action: "UPDATE",
                resource: "contacts",
                resourceId: updated.id,
                userId: auditContext?.userId,
                context: auditContext,
                before: existing,
                after: updated,
                details: {
                    websiteId: updated.websiteId,
                    email: updated.email,
                    status: updated.status,
                },
            });

            return updated;
        } catch (error) {
            if (error instanceof AppError) throw error;
            throw new AppError("Failed to update contact", "UPDATE_CONTACT_ERROR", 500);
        }
    }
}
