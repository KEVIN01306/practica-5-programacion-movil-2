import { api } from '../../../../core/api/axios.instance';
import type {
    AssetDto,
    PaginatedAssetsResponse,
    AssetFilters,
    CreateAssetPayload,
    UpdateAssetPayload,
    CopyAssetPayload,
} from '../../domain/dto/assets.dto';


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

export const getAssetsPaginated = async (
    filters: AssetFilters = {}
): Promise<PaginatedAssetsResponse> => {
    const page = filters.page || 1;
    const limit = filters.limit || 10;
    const params: Record<string, any> = { page, limit };

    if (filters.brandId) params.brandId = filters.brandId;
    if (filters.folderId !== undefined) {
        params.folderId = filters.folderId === null ? 'null' : filters.folderId;
    }
    if (filters.type) params.type = filters.type;
    if (filters.sku) params.sku = filters.sku;
    if (filters.q) params.q = filters.q;

    const response = await api.get<ApiResponse<AssetDto[]>>('/assets', { params });
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getAssetById = async (id: string): Promise<AssetDto> => {
    const response = await api.get<ApiResponse<AssetDto>>(`/assets/${id}`);
    return response.data.data;
};

export const createAsset = async (payload: CreateAssetPayload): Promise<AssetDto> => {
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.description) formData.append('description', payload.description);
    if (payload.sku) formData.append('sku', payload.sku);
    formData.append('brandId', payload.brandId);
    if (payload.folderId) {
        formData.append('folderId', payload.folderId);
    } else {
        formData.append('folderId', 'null');
    }
    formData.append('file', payload.file);

    const response = await api.post<ApiResponse<AssetDto>>('/assets', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export const updateAsset = async (
    id: string,
    payload: UpdateAssetPayload
): Promise<AssetDto> => {
    const formData = new FormData();
    if (payload.name !== undefined) formData.append('name', payload.name);
    if (payload.description !== undefined) {
        formData.append('description', payload.description || '');
    }
    if (payload.sku !== undefined) {
        formData.append('sku', payload.sku || '');
    }
    if (payload.brandId !== undefined) formData.append('brandId', payload.brandId);
    if (payload.folderId !== undefined) {
        formData.append('folderId', payload.folderId === null ? 'null' : payload.folderId);
    }
    if (payload.file) {
        formData.append('file', payload.file);
    }

    const response = await api.patch<ApiResponse<AssetDto>>(`/assets/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data.data;
};

export const copyAsset = async (
    id: string,
    payload: CopyAssetPayload
): Promise<AssetDto> => {
    const response = await api.post<ApiResponse<AssetDto>>(`/assets/${id}/copy`, payload);
    return response.data.data;
};

export const deleteAsset = async (id: string): Promise<void> => {
    await api.delete(`/assets/${id}`);
};

