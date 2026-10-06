import { api } from '../../../../core/api/axios.instance';
import type {
    FolderDto,
    FolderDetailDto,
    CreateFolderDto,
    UpdateFolderDto,
    CopyFolderDto,
} from '../../domain/dto/folders.dto';

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

export interface PaginatedFoldersResponse {
    data: FolderDto[];
    total: number;
    limit: number;
    offset: number;
}

export const getFoldersPaginated = async (
    brandId?: string,
    parentId?: string | null,
    page: number = 1,
    limit: number = 10,
    q?: string
): Promise<PaginatedFoldersResponse> => {
    const params: Record<string, any> = { page, limit };
    if (brandId) params.brandId = brandId;
    if (parentId !== undefined) params.parentId = parentId === null ? 'null' : parentId;
    if (q) params.q = q;

    const response = await api.get<ApiResponse<FolderDto[]>>('/folders', { params });
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getAllFoldersInLevel = async (
    brandId: string,
    parentId?: string | null
): Promise<FolderDto[]> => {
    const params: Record<string, any> = {
        all: true,
        brandId,
        parentId: parentId === null ? 'null' : parentId ?? 'null',
    };
    const response = await api.get<ApiResponse<FolderDto[]>>('/folders', { params });
    return response.data.data;
};

export const getFolderById = async (id: string): Promise<FolderDetailDto> => {
    const response = await api.get<ApiResponse<FolderDetailDto>>(`/folders/${id}`);
    return response.data.data;
};

export const createFolder = async (data: CreateFolderDto): Promise<FolderDto> => {
    const response = await api.post<ApiResponse<FolderDto>>('/folders', data);
    return response.data.data;
};

export const updateFolder = async (id: string, data: UpdateFolderDto): Promise<FolderDto> => {
    const response = await api.put<ApiResponse<FolderDto>>(`/folders/${id}`, data);
    return response.data.data;
};

export const copyFolder = async (id: string, data: CopyFolderDto): Promise<FolderDto> => {
    const response = await api.post<ApiResponse<FolderDto>>(`/folders/${id}/copy`, data);
    return response.data.data;
};

export const deleteFolder = async (id: string): Promise<void> => {
    await api.delete(`/folders/${id}`);
};

