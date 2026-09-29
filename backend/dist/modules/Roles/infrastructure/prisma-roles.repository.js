import AppError from "../../../shared/errors/AppError.js";
export class PrismaRolesRepository {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(params) {
        const { page = 1, limit = 10, q, all = false } = params;
        const where = {};
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
            return { data: roles, total };
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
        return { data: roles, total };
    }
    async findById(id) {
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
        return role || null;
    }
    async findByName(name) {
        const role = await this.prisma.role.findFirst({
            where: {
                name: name.trim()
            }
        });
        return role || null;
    }
    async create(data) {
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
        return role;
    }
    async update(id, data) {
        const updateData = {};
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
        return role;
    }
    async delete(id) {
        await this.prisma.role.delete({
            where: { id }
        });
    }
    async findAllPermissions() {
        const permissions = await this.prisma.permission.findMany({
            orderBy: {
                action: "asc"
            }
        });
        return permissions;
    }
    async findRolePermissions(roleId) {
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
        return rolePermissions.map((rp) => rp.permission);
    }
    async updateRolePermissions(roleId, permissionIds) {
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
        const currentPermissionMap = new Map(); // permissionId -> action
        role.rolePermissions.forEach(rp => {
            currentPermissionMap.set(rp.permissionId, rp.permission.action);
        });
        const currentIds = Array.from(currentPermissionMap.keys());
        const previousPermissionActions = Array.from(currentPermissionMap.values());
        const toAdd = uniqueRequestedIds.filter(id => !currentPermissionMap.has(id));
        const toRemove = currentIds.filter(id => !uniqueRequestedIds.includes(id));
        // Get actions for added and removed
        let addedPermissions = [];
        if (toAdd.length > 0) {
            const addedPerms = await this.prisma.permission.findMany({
                where: { id: { in: toAdd } },
                select: { action: true }
            });
            addedPermissions = addedPerms.map(p => p.action);
        }
        const removedPermissions = toRemove.map(id => currentPermissionMap.get(id) || id);
        // Execute changes atomically inside a Prisma transaction
        await this.prisma.$transaction(async (tx) => {
            if (toRemove.length > 0) {
                await tx.rolePermission.deleteMany({
                    where: {
                        roleId,
                        permissionId: { in: toRemove }
                    }
                });
            }
            if (toAdd.length > 0) {
                await tx.rolePermission.createMany({
                    data: toAdd.map(permissionId => ({
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
    async getPermissionsMatrix() {
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
            roles: roles,
            permissions: permissions,
            assignments: rolePermissions
        };
    }
}
//# sourceMappingURL=prisma-roles.repository.js.map