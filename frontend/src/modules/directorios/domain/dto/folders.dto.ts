export interface FolderDto {
    id: string;
    name: string;
    description: string | null;
    brandId: string;
    parentId: string | null;
    createdAt: string;
    updatedAt: string;
    brand?: {
        id: string;
        name: string;
    };
    parent?: {
        id: string;
        name: string;
    } | null;
    _count?: {
        children: number;
        images: number;
        assets?: number;
    };
}

export interface FolderBreadcrumbItem {
    id: string;
    name: string;
    parentId: string | null;
}

export interface FolderDetailDto extends FolderDto {
    breadcrumbs: FolderBreadcrumbItem[];
}

export interface CreateFolderDto {
    name: string;
    description?: string | null;
    brandId: string;
    parentId?: string | null;
}

export interface UpdateFolderDto {
    name?: string;
    description?: string | null;
    parentId?: string | null;
}

export interface CopyFolderDto {
    targetBrandId: string;
    targetParentId?: string | null;
}

