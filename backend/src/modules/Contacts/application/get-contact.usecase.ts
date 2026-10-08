import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { ContactEntity } from "../domain/contact.entity.js";
import AppError from "../../../shared/errors/AppError.js";

export class GetContactUseCase {
    constructor(private readonly contactsRepository: ContactsRepository) {}

    async execute(id: string): Promise<ContactEntity> {
        const contact = await this.contactsRepository.findById(id);
        if (!contact) {
            throw new AppError("Contact not found", "CONTACT_NOT_FOUND", 404);
        }
        return contact;
    }
}
