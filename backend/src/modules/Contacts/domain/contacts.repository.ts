import type {
    ContactEntity,
    CreateContactInput,
    UpdateContactInput,
    ListContactsFilters,
} from "./contact.entity.js";

export interface ContactsRepository {
    create(data: CreateContactInput): Promise<ContactEntity>;
    findById(id: string): Promise<ContactEntity | null>;
    findByEmail(websiteId: string, email: string): Promise<ContactEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListContactsFilters;
    }): Promise<{ data: ContactEntity[]; total: number }>;
    update(id: string, data: UpdateContactInput): Promise<ContactEntity>;
    delete(id: string): Promise<void>;
    count(filters?: ListContactsFilters): Promise<number>;
    findOrCreate(data: {
        websiteId: string;
        email: string;
        firstName?: string | null;
        lastName?: string | null;
        phone?: string | null;
    }): Promise<ContactEntity>;
}
