import type {
    ContactEntity,
    FindOrCreateContactInput,
} from "./contact.entity.js";

export interface ContactsRepository {
    findByEmail(websiteId: string, email: string): Promise<ContactEntity | null>;
    findOrCreate(data: FindOrCreateContactInput): Promise<ContactEntity>;
    findById(id: string): Promise<ContactEntity | null>;
}
