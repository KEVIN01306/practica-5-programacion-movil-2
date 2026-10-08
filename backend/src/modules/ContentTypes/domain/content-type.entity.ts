export interface ContentTypeEntity {
    id: string;
    websiteId: string;
    name: string;
    slug: string;
    description: string | null;
    fieldsCount?: number;
    itemsCount?: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateContentTypeInput {
    websiteId: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface UpdateContentTypeInput {
    name?: string;
    slug?: string;
    description?: string | null;
}

export interface ListContentTypesFilters {
    websiteId?: string;
    search?: string;
}
