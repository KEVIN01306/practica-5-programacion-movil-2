import type { ContactsRepository } from "../domain/contacts.repository.js";
import type { ContactEntity, ListContactsFilters } from "../domain/contact.entity.js";

export class ListContactsUseCase {
    constructor(private readonly contactsRepository: ContactsRepository) {}

    async execute(params: {
        page?: number;
        limit?: number;
        filters?: ListContactsFilters;
    }): Promise<{ data: ContactEntity[]; total: number; page: number; limit: number; totalPages: number }> {
        const page = Math.max(1, params.page || 1);
        const limit = Math.max(1, Math.min(100, params.limit || 10));

        const { data, total } = await this.contactsRepository.list({
            page,
            limit,
            filters: params.filters,
        });

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit) || 1,
        };
    }
}
