export type AssetType = 'IMAGE' | 'DOCUMENT' | 'VIDEO' | 'AUDIO' | 'ARCHIVE' | 'OTHER';

export interface AssetDto {
    id: string;
    name: string;
    description: string | null;
    url: string;
    sku: string | null;
    type: AssetType;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    extension: string | null;
    metadata: any;
    brandId: string;
    folderId: string | null;
    createdAt: string;
    updatedAt: string;
    brand?: {
        id: string;
        name: string;
    };
    folder?: {
        id: string;
        name: string;
    } | null;
}

export interface PaginatedAssetsResponse {
    data: AssetDto[];
    total: number;
    limit: number;
    offset: number;
}

export interface AssetFilters {
    brandId?: string;
    folderId?: string | null;
    type?: AssetType;
    sku?: string;
    q?: string;
    page?: number;
    limit?: number;
}

export interface CreateAssetPayload {
    name: string;
    description?: string;
    sku?: string;
    brandId: string;
    folderId?: string | null;
    file: File;
}

export interface UpdateAssetPayload {
    name?: string;
    description?: string | null;
    sku?: string | null;
    brandId?: string;
    folderId?: string | null;
    file?: File | null;
}

export interface CopyAssetPayload {
    targetBrandId: string;
    targetFolderId?: string | null;
}

