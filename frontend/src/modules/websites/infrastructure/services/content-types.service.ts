import { api } from '../../../../core/api/axios.instance';
import type {
    ContentTypeDto,
    CreateContentTypeDto,
    UpdateContentTypeDto,
    ContentFieldDto,
    CreateContentFieldDto,
    UpdateContentFieldDto,
    ContentItemDto,
} from '../../domain/dto/content-types.dto';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
}

interface PaginatedApiResponse<T> {
    status: string;
    message: string;
    data: T[];
    count: number;
    meta: {
        total: number;
        limit: number;
        offset: number;
    };
}

/**
 * Fetch all content types for a website (with pagination & search support)
 */
export const getContentTypesByWebsite = async (
    websiteId: string,
    params?: { page?: number; limit?: number; search?: string }
): Promise<{ data: ContentTypeDto[]; total: number }> => {
    const response = await api.get<PaginatedApiResponse<ContentTypeDto>>(
        `/websites/${websiteId}/content-types`,
        { params }
    );
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
    };
};

/**
 * Get a single content type by ID
 */
export const getContentTypeById = async (id: string): Promise<ContentTypeDto> => {
    const response = await api.get<ApiResponse<ContentTypeDto>>(`/content-types/${id}`);
    return response.data.data;
};

/**
 * Create a new content type under a website
 */
export const createContentType = async (
    data: CreateContentTypeDto
): Promise<ContentTypeDto> => {
    const response = await api.post<ApiResponse<ContentTypeDto>>(
        `/websites/${data.websiteId}/content-types`,
        data
    );
    return response.data.data;
};

/**
 * Update an existing content type
 */
export const updateContentType = async (
    id: string,
    data: UpdateContentTypeDto
): Promise<ContentTypeDto> => {
    const response = await api.put<ApiResponse<ContentTypeDto>>(`/content-types/${id}`, data);
    return response.data.data;
};

/**
 * Delete a content type and its cascade relations
 */
export const deleteContentType = async (id: string): Promise<void> => {
    await api.delete(`/content-types/${id}`);
};

/**
 * List all fields for a content type
 */
export const getContentFields = async (contentTypeId: string): Promise<ContentFieldDto[]> => {
    const response = await api.get<ApiResponse<ContentFieldDto[]>>(
        `/content-types/${contentTypeId}/fields`
    );
    return response.data.data;
};

/**
 * Get a single field by ID
 */
export const getContentFieldById = async (id: string): Promise<ContentFieldDto> => {
    const response = await api.get<ApiResponse<ContentFieldDto>>(`/content-fields/${id}`);
    return response.data.data;
};

/**
 * Create a new field for a content type
 */
export const createContentField = async (
    contentTypeId: string,
    data: Omit<CreateContentFieldDto, 'contentTypeId'>
): Promise<ContentFieldDto> => {
    const response = await api.post<ApiResponse<ContentFieldDto>>(
        `/content-types/${contentTypeId}/fields`,
        { ...data, contentTypeId }
    );
    return response.data.data;
};

/**
 * Update an existing field
 */
export const updateContentField = async (
    id: string,
    data: UpdateContentFieldDto
): Promise<ContentFieldDto> => {
    const response = await api.put<ApiResponse<ContentFieldDto>>(`/content-fields/${id}`, data);
    return response.data.data;
};

/**
 * Delete a content field
 */
export const deleteContentField = async (id: string): Promise<void> => {
    await api.delete(`/content-fields/${id}`);
};

/**
 * List all items for a content type
 */
export const getContentItems = async (
    contentTypeId: string,
    params?: { page?: number; limit?: number; isPublished?: boolean }
): Promise<{ data: ContentItemDto[]; total: number }> => {
    const response = await api.get<PaginatedApiResponse<ContentItemDto>>(
        `/content-types/${contentTypeId}/items`,
        { params }
    );
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
    };
};

/**
 * Get a single content item by ID
 */
export const getContentItemById = async (id: string): Promise<ContentItemDto> => {
    const response = await api.get<ApiResponse<ContentItemDto>>(`/content-items/${id}`);
    return response.data.data;
};

/**
 * Create a new item for a content type
 */
export const createContentItem = async (
    contentTypeId: string,
    data: { data: Record<string, any>; isPublished?: boolean }
): Promise<ContentItemDto> => {
    const response = await api.post<ApiResponse<ContentItemDto>>(
        `/content-types/${contentTypeId}/items`,
        { ...data, contentTypeId }
    );
    return response.data.data;
};

/**
 * Update an existing content item
 */
export const updateContentItem = async (
    id: string,
    data: { data?: Record<string, any>; isPublished?: boolean }
): Promise<ContentItemDto> => {
    const response = await api.put<ApiResponse<ContentItemDto>>(`/content-items/${id}`, data);
    return response.data.data;
};

/**
 * Delete a content item
 */
export const deleteContentItem = async (id: string): Promise<void> => {
    await api.delete(`/content-items/${id}`);
};

/**
 * Bulk create / import content items from JSON array or objects
 */
export const bulkCreateContentItems = async (
    contentTypeId: string,
    items: Array<{ data: Record<string, any>; isPublished?: boolean }> | Record<string, any>[]
): Promise<{ count: number; items: ContentItemDto[] }> => {
    const response = await api.post<ApiResponse<{ count: number; items: ContentItemDto[] }>>(
        `/content-types/${contentTypeId}/items/bulk`,
        items
    );
    return response.data.data;
};

/**
 * Export schema fields of a content type as JSON
 */
export const exportFieldsJson = async (contentTypeId: string): Promise<any[]> => {
    const response = await api.get<any[]>(
        `/content-types/${contentTypeId}/fields/export/json`
    );
    return response.data;
};

/**
 * Bulk create / import schema fields for a content type from JSON
 */
export const bulkCreateFields = async (
    contentTypeId: string,
    fields: Array<{ name: string; key: string; type: string; isRequired?: boolean }> | { fields: any[] }
): Promise<{ created: ContentFieldDto[]; skipped: string[]; totalCreated: number }> => {
    const response = await api.post<ApiResponse<{ created: ContentFieldDto[]; skipped: string[]; totalCreated: number }>>(
        `/content-types/${contentTypeId}/fields/bulk`,
        fields
    );
    return response.data.data;
};
