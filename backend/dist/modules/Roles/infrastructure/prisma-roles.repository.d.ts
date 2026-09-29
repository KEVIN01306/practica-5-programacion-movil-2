import type { PrismaClient } from "@prisma/client";
import type { Role, CreateRole, UpdateRole, Permission, PermissionsMatrix } from "../domain/role.entity.js";
import type { RolesRepository, ListRolesParams, UpdateRolePermissionsResult } from "../domain/roles.repository.js";
export declare class PrismaRolesRepository implements RolesRepository {
    private readonly prisma;
    constructor(prisma: PrismaClient);
    findAll(params: ListRolesParams): Promise<{
        data: Role[];
        total: number;
    }>;
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
//# sourceMappingURL=prisma-roles.repository.d.ts.map