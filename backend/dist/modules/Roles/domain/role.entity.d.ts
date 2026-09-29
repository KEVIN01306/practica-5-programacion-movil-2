export interface Role {
    id: string;
    name: string;
    description: string | null;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count?: {
        userRoles: number;
        rolePermissions: number;
    };
}
export interface CreateRole {
    name: string;
    description?: string | null;
}
export interface UpdateRole {
    name?: string;
    description?: string | null;
}
export interface Permission {
    id: string;
    action: string;
    description: string | null;
    createdAt: Date;
}
export interface RolePermissionAssignment {
    roleId: string;
    permissionId: string;
}
export interface PermissionsMatrix {
    roles: Role[];
    permissions: Permission[];
    assignments: RolePermissionAssignment[];
}
//# sourceMappingURL=role.entity.d.ts.map