import type {
    FormEntity,
    CreateFormInput,
    UpdateFormInput,
    ListFormsFilters,
} from "./form.entity.js";

export interface FormsRepository {
    create(data: CreateFormInput): Promise<FormEntity>;
    findById(id: string): Promise<FormEntity | null>;
    findBySlug(websiteId: string, slug: string): Promise<FormEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListFormsFilters;
    }): Promise<{ data: FormEntity[]; total: number }>;
    update(id: string, data: UpdateFormInput): Promise<FormEntity>;
    delete(id: string): Promise<void>;
    countByWebsite(websiteId: string): Promise<number>;
}
