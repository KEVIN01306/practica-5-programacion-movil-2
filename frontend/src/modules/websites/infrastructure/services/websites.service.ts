import { api } from '../../../../core/api/axios.instance';
import type {
    WebsiteDto,
    CreateWebsiteDto,
    UpdateWebsiteDto,
} from '../../domain/dto/websites.dto';

interface ApiResponse<T> {
    status: string;
    message: string;
    data: T;
    meta?: {
        total: number;
        limit: number;
        offset: number;
    };
}

export interface PaginatedWebsitesResponse {
    data: WebsiteDto[];
    total: number;
    limit: number;
    offset: number;
}

export const getWebsitesPaginated = async (
    page: number = 1,
    limit: number = 10,
    search?: string,
    isActive?: boolean
): Promise<PaginatedWebsitesResponse> => {
    const params: Record<string, any> = { page, limit };
    if (search) params.search = search;
    if (isActive !== undefined) params.isActive = isActive;

    const response = await api.get<ApiResponse<WebsiteDto[]>>('/websites', { params });
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getWebsiteById = async (id: string): Promise<WebsiteDto> => {
    const response = await api.get<ApiResponse<WebsiteDto>>(`/websites/${id}`);
    return response.data.data;
};

export const createWebsite = async (data: CreateWebsiteDto): Promise<WebsiteDto> => {
    const response = await api.post<ApiResponse<WebsiteDto>>('/websites', data);
    return response.data.data;
};

export const updateWebsite = async (id: string, data: UpdateWebsiteDto): Promise<WebsiteDto> => {
    const response = await api.put<ApiResponse<WebsiteDto>>(`/websites/${id}`, data);
    return response.data.data;
};

export const deleteWebsite = async (id: string): Promise<void> => {
    await api.delete(`/websites/${id}`);
};

export const regenerateWebsiteApiKey = async (id: string): Promise<WebsiteDto> => {
    const response = await api.post<ApiResponse<WebsiteDto>>(`/websites/${id}/regenerate-api-key`);
    return response.data.data;
};
