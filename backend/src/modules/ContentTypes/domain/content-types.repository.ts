import type {
    ContentTypeEntity,
    CreateContentTypeInput,
    UpdateContentTypeInput,
    ListContentTypesFilters,
} from "./content-type.entity.js";

export interface ContentTypesRepository {
    create(data: CreateContentTypeInput): Promise<ContentTypeEntity>;
    findById(id: string): Promise<ContentTypeEntity | null>;
    findBySlug(websiteId: string, slug: string): Promise<ContentTypeEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListContentTypesFilters;
    }): Promise<{ data: ContentTypeEntity[]; total: number }>;
    update(id: string, data: UpdateContentTypeInput): Promise<ContentTypeEntity>;
    delete(id: string): Promise<void>;
    countByWebsite(websiteId: string): Promise<number>;
}
