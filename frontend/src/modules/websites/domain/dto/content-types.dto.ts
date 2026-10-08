export type FieldType =
    | 'STRING'
    | 'TEXT'
    | 'NUMBER'
    | 'BOOLEAN'
    | 'DATE'
    | 'JSON'
    | 'URL';

export interface ContentTypeDto {
    id: string;
    websiteId: string;
    name: string;
    slug: string;
    description: string | null;
    fieldsCount: number;
    itemsCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContentTypeDto {
    websiteId: string;
    name: string;
    slug: string;
    description?: string | null;
}

export interface UpdateContentTypeDto {
    name?: string;
    slug?: string;
    description?: string | null;
}

export interface ContentFieldDto {
    id: string;
    contentTypeId: string;
    name: string;
    key: string;
    type: FieldType;
    isRequired: boolean;
    createdAt: string;
}

export interface CreateContentFieldDto {
    contentTypeId?: string;
    name: string;
    key: string;
    type: FieldType;
    isRequired?: boolean;
}

export interface UpdateContentFieldDto {
    name?: string;
    key?: string;
    type?: FieldType;
    isRequired?: boolean;
}

export interface ContentItemDto {
    id: string;
    contentTypeId: string;
    data: Record<string, any>;
    isPublished: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateContentItemDto {
    contentTypeId?: string;
    data: Record<string, any>;
    isPublished?: boolean;
}

export interface UpdateContentItemDto {
    data?: Record<string, any>;
    isPublished?: boolean;
}

