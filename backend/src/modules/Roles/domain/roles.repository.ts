import type { Role, CreateRole, UpdateRole, Permission, PermissionsMatrix } from "./role.entity.js";

export interface ListRolesParams {
    page?: number;
    limit?: number;
    q?: string;
    all?: boolean;
}

export interface UpdateRolePermissionsResult {
    roleId: string;
    roleName: string;
    previousPermissionActions: string[];
    currentPermissionActions: string[];
    addedPermissions: string[];
    removedPermissions: string[];
    currentPermissions: Permission[];
}

export interface RolesRepository {
    findAll(params: ListRolesParams): Promise<{ data: Role[]; total: number }>;
    findById(id: string): Promise<Role | null>;
    findByName(name: string): Promise<Role | null>;
    create(data: CreateRole): Promise<Role>;
    update(id: string, data: UpdateRole): Promise<Role>;
    delete(id: string): Promise<void>;
    
    findAllPermissions(): Promise<Permission[]>;
    findRolePermissions(roleId: string): Promise<Permission[]>;
    updateRolePermissions(roleId: string, permissionIds: string[]): Promise<UpdateRolePermissionsResult>;
    getPermissionsMatrix(): Promise<PermissionsMatrix>;
}
