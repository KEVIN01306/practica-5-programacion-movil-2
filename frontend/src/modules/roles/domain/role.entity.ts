export interface RoleItem {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    createdAt: string;
    updatedAt: string;
    _count?: {
        userRoles: number;
        rolePermissions: number;
    };
}

export interface PermissionItem {
    id: string;
    action: string;
    description: string | null;
    createdAt: string;
}

export interface RolePermissionAssignment {
    roleId: string;
    permissionId: string;
}

export interface PermissionsMatrixData {
    roles: RoleItem[];
    permissions: PermissionItem[];
    assignments: RolePermissionAssignment[];
}
