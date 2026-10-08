export interface ContentItemEntity {
    id: string;
    contentTypeId: string;
    data: Record<string, any>;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreateContentItemInput {
    contentTypeId: string;
    data: Record<string, any>;
    isPublished?: boolean;
}

export interface UpdateContentItemInput {
    data?: Record<string, any>;
    isPublished?: boolean;
}

export interface ListContentItemsFilters {
    contentTypeId?: string;
    isPublished?: boolean;
    search?: string;
    fieldFilters?: Record<string, any>;
}
