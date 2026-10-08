import type { PrismaClient } from "@prisma/client";
import type { Role, CreateRole, UpdateRole, Permission, PermissionsMatrix } from "../domain/role.entity.js";
import type { RolesRepository, ListRolesParams, UpdateRolePermissionsResult } from "../domain/roles.repository.js";
import AppError from "@shared/errors/AppError.js";

export class PrismaRolesRepository implements RolesRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findAll(params: ListRolesParams): Promise<{ data: Role[]; total: number }> {
        const { page = 1, limit = 10, q, all = false } = params;

        const where: any = {};
        if (q && q.trim()) {
            const query = q.trim();
            where.OR = [
                { name: { contains: query } },
                { description: { contains: query } },
            ];
        }

        const total = await this.prisma.role.count({ where });

        if (all) {
            const roles = await this.prisma.role.findMany({
                where,
                orderBy: [
                    { isSystem: "desc" },
                    { name: "asc" }
                ],
                include: {
                    _count: {
                        select: {
                            userRoles: true,
                            rolePermissions: true,
                        }
                    }
                }
            });

            return { data: roles as Role[], total };
        }

        const offset = Math.max(0, (page - 1) * limit);

        const roles = await this.prisma.role.findMany({
            where,
            skip: offset,
            take: limit,
            orderBy: [
                { isSystem: "desc" },
                { name: "asc" }
            ],
            include: {
                _count: {
                    select: {
                        userRoles: true,
                        rolePermissions: true,
                    }
                }
            }
        });

        return { data: roles as Role[], total };
    }

    async findById(id: string): Promise<Role | null> {
        const role = await this.prisma.role.findUnique({
            where: { id },
            include: {
                _count: {
                    select: {
                        userRoles: true,
                        rolePermissions: true,
                    }
                }
            }
        });

        return (role as Role) || null;
    }

    async findByName(name: string): Promise<Role | null> {
        const role = await this.prisma.role.findFirst({
            where: {
                name: name.trim()
            }
        });

        return (role as Role) || null;
    }

    async create(data: CreateRole): Promise<Role> {
        const role = await this.prisma.role.create({
            data: {
                name: data.name.trim(),
                description: data.description ? data.description.trim() : null,
                isSystem: false,
            },
            include: {
                _count: {
                    select: {
                        userRoles: true,
                        rolePermissions: true,
                    }
                }
            }
        });

        return role as Role;
    }

    async update(id: string, data: UpdateRole): Promise<Role> {
        const updateData: any = {};
        if (data.name !== undefined) {
            updateData.name = data.name.trim();
        }
        if (data.description !== undefined) {
            updateData.description = data.description ? data.description.trim() : null;
        }

        const role = await this.prisma.role.update({
            where: { id },
            data: updateData,
            include: {
                _count: {
                    select: {
                        userRoles: true,
                        rolePermissions: true,
                    }
                }
            }
        });

        return role as Role;
    }

    async delete(id: string): Promise<void> {
        await this.prisma.role.delete({
            where: { id }
        });
    }

    async findAllPermissions(): Promise<Permission[]> {
        const permissions = await this.prisma.permission.findMany({
            orderBy: {
                action: "asc"
            }
        });

        return permissions as Permission[];
    }

    async findRolePermissions(roleId: string): Promise<Permission[]> {
        const rolePermissions = await this.prisma.rolePermission.findMany({
            where: { roleId },
            include: {
                permission: true
            },
            orderBy: {
                permission: {
                    action: "asc"
                }
            }
        });

        return rolePermissions.map((rp: any) => rp.permission as Permission);
    }

    async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<UpdateRolePermissionsResult> {
        const role = await this.prisma.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) {
            throw new AppError("Role not found", "NOT_FOUND", 404);
        }

        // Deduplicate incoming requested IDs
        const uniqueRequestedIds = Array.from(new Set(permissionIds));

        // Validate all incoming permission IDs exist
        if (uniqueRequestedIds.length > 0) {
            const existingCount = await this.prisma.permission.count({
                where: {
                    id: { in: uniqueRequestedIds }
                }
            });

            if (existingCount !== uniqueRequestedIds.length) {
                throw new AppError("One or more permission IDs are invalid or do not exist", "BAD_REQUEST", 400);
            }
        }

        // Calculate current permissions
        const currentPermissionMap = new Map<string, string>(); // permissionId -> action
        role.rolePermissions.forEach((rp: any) => {
            currentPermissionMap.set(rp.permissionId, rp.permission.action);
        });

        const currentIds = Array.from(currentPermissionMap.keys());
        const previousPermissionActions = Array.from(currentPermissionMap.values());

        const toAdd = uniqueRequestedIds.filter(id => !currentPermissionMap.has(id));
        const toRemove = currentIds.filter(id => !uniqueRequestedIds.includes(id));

        // Get actions for added and removed
        let addedPermissions: string[] = [];
        if (toAdd.length > 0) {
            const addedPerms = await this.prisma.permission.findMany({
                where: { id: { in: toAdd } },
                select: { action: true }
            });
            addedPermissions = addedPerms.map((p: any) => p.action);
        }

        const removedPermissions = toRemove.map(id => currentPermissionMap.get(id) || id);

        // Execute changes atomically inside a Prisma transaction
        await this.prisma.$transaction(async (tx) => {
            if (toRemove.length > 0) {
                await (tx as any).rolePermission.deleteMany({
                    where: {
                        roleId,
                        permissionId: { in: toRemove }
                    }
                });
            }

            if (toAdd.length > 0) {
                await (tx as any).rolePermission.createMany({
                    data: toAdd.map((permissionId: string) => ({
                        roleId,
                        permissionId
                    })),
                    skipDuplicates: true
                });
            }
        });

        // Fetch updated permissions
        const updatedPermissions = await this.findRolePermissions(roleId);
        const currentPermissionActions = updatedPermissions.map(p => p.action);

        return {
            roleId: role.id,
            roleName: role.name,
            previousPermissionActions,
            currentPermissionActions,
            addedPermissions,
            removedPermissions,
            currentPermissions: updatedPermissions
        };
    }

    async getPermissionsMatrix(): Promise<PermissionsMatrix> {
        const [roles, permissions, rolePermissions] = await Promise.all([
            this.prisma.role.findMany({
                orderBy: [
                    { isSystem: "desc" },
                    { name: "asc" }
                ],
                include: {
                    _count: {
                        select: {
                            userRoles: true,
                            rolePermissions: true,
                        }
                    }
                }
            }),
            this.prisma.permission.findMany({
                orderBy: {
                    action: "asc"
                }
            }),
            this.prisma.rolePermission.findMany({
                select: {
                    roleId: true,
                    permissionId: true
                }
            })
        ]);

        return {
            roles: roles as Role[],
            permissions: permissions as Permission[],
            assignments: rolePermissions
        };
    }
}
