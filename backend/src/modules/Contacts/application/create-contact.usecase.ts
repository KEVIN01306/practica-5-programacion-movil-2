import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { WebsitesRepository } from "../../Websites/domain/websites.repository.js";
import type { ContactEntity, CreateContactInput } from "../domain/contact.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
import AppError from "../../../shared/errors/AppError.js";
import { UniqueConstraintError } from "../../../shared/db/database/errors/UniqueConstraintError.js";

export class CreateContactUseCase {
    constructor(
        private readonly contactsRepository: ContactsRepository,
        private readonly websitesRepository: WebsitesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(input: CreateContactInput, auditContext?: AuditContext): Promise<ContactEntity> {
        try {
            const website = await this.websitesRepository.findById(input.websiteId);
            if (!website) {
                throw new AppError("Website not found", "WEBSITE_NOT_FOUND", 404);
            }

            const normalizedEmail = input.email.toLowerCase().trim();
            const existing = await this.contactsRepository.findByEmail(input.websiteId, normalizedEmail);
            if (existing) {
                throw new AppError(
                    "A contact with this email already exists for this website",
                    "CONTACT_ALREADY_EXISTS",
                    409
                );
            }

            const contact = await this.contactsRepository.create({
                ...input,
                email: normalizedEmail,
            });

            await this.auditLogService.record({
                action: "CREATE",
                resource: "contacts",
                resourceId: contact.id,
                userId: auditContext?.userId,
                context: auditContext,
                after: contact,
                details: {
                    websiteId: contact.websiteId,
                    email: contact.email,
                    status: contact.status,
                },
            });

            return contact;
        } catch (error) {
            if (error instanceof AppError) throw error;
            if (error instanceof UniqueConstraintError) {
                throw new AppError(
                    "A contact with this email already exists for this website",
                    "CONTACT_CONFLICT",
                    409
                );
            }
            throw new AppError("Failed to create contact", "CREATE_CONTACT_ERROR", 500);
        }
    }
}
