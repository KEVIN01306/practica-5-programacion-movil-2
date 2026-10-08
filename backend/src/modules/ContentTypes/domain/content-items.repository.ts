import type {
    ContentItemEntity,
    CreateContentItemInput,
    UpdateContentItemInput,
    ListContentItemsFilters,
} from "./content-item.entity.js";

export interface ContentItemsRepository {
    create(data: CreateContentItemInput): Promise<ContentItemEntity>;
    createMany(items: CreateContentItemInput[]): Promise<ContentItemEntity[]>;
    findById(id: string): Promise<ContentItemEntity | null>;
    list(params: {
        page?: number;
        limit?: number;
        filters?: ListContentItemsFilters;
    }): Promise<{ data: ContentItemEntity[]; total: number }>;
    update(id: string, data: UpdateContentItemInput): Promise<ContentItemEntity>;
    delete(id: string): Promise<void>;
    countByContentType(contentTypeId: string): Promise<number>;
}
