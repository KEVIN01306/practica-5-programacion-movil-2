import { api } from '../../../../core/api/axios.instance';
import type { RoleItem, PermissionItem, PermissionsMatrixData } from '../../domain/role.entity';
import type { CreateRoleDto, UpdateRoleDto, UpdateRolePermissionsDto } from '../../domain/dto/roles.dto';

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

export interface PaginatedRolesResponse {
    data: RoleItem[];
    total: number;
    limit: number;
    offset: number;
}

export const getRolesPaginated = async (
    page: number = 1,
    limit: number = 10,
    q?: string
): Promise<PaginatedRolesResponse> => {
    const params: Record<string, any> = { page, limit };
    if (q) params.q = q;

    const response = await api.get<ApiResponse<RoleItem[]>>('/roles', { params });
    return {
        data: response.data.data,
        total: response.data.meta?.total ?? response.data.data.length,
        limit: response.data.meta?.limit ?? limit,
        offset: response.data.meta?.offset ?? (page - 1) * limit,
    };
};

export const getAllRoles = async (): Promise<RoleItem[]> => {
    const response = await api.get<ApiResponse<RoleItem[]>>('/roles', { params: { all: true } });
    return response.data.data;
};

export const getRoleById = async (id: string): Promise<RoleItem> => {
    const response = await api.get<ApiResponse<RoleItem>>(`/roles/${id}`);
    return response.data.data;
};

export const createRole = async (data: CreateRoleDto): Promise<RoleItem> => {
    const response = await api.post<ApiResponse<RoleItem>>('/roles', data);
    return response.data.data;
};

export const updateRole = async (id: string, data: UpdateRoleDto): Promise<RoleItem> => {
    const response = await api.patch<ApiResponse<RoleItem>>(`/roles/${id}`, data);
    return response.data.data;
};

export const deleteRole = async (id: string): Promise<void> => {
    await api.delete(`/roles/${id}`);
};

export const getPermissionsCatalog = async (): Promise<PermissionItem[]> => {
    const response = await api.get<ApiResponse<PermissionItem[]>>('/permissions');
    return response.data.data;
};

export const getRolePermissions = async (roleId: string): Promise<PermissionItem[]> => {
    const response = await api.get<ApiResponse<PermissionItem[]>>(`/roles/${roleId}/permissions`);
    return response.data.data;
};

export const updateRolePermissions = async (
    roleId: string,
    data: UpdateRolePermissionsDto
): Promise<PermissionItem[]> => {
    const response = await api.put<ApiResponse<PermissionItem[]>>(`/roles/${roleId}/permissions`, data);
    return response.data.data;
};

export const getPermissionsMatrix = async (): Promise<PermissionsMatrixData> => {
    const response = await api.get<ApiResponse<PermissionsMatrixData>>('/roles/matrix');
    return response.data.data;
};
