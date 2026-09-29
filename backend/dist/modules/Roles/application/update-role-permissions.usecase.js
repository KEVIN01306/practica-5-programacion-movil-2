export class UpdateRolePermissionsUseCase {
    rolesRepository;
    auditLogService;
    constructor(rolesRepository, auditLogService) {
        this.rolesRepository = rolesRepository;
        this.auditLogService = auditLogService;
    }
    async execute(roleId, permissionIds, auditContext) {
        const result = await this.rolesRepository.updateRolePermissions(roleId, permissionIds);
        // Only record audit log if there were actual changes in permissions
        if (result.addedPermissions.length > 0 || result.removedPermissions.length > 0) {
            await this.auditLogService.record({
                action: "UPDATE",
                resource: "role",
                resourceId: roleId,
                context: auditContext,
                before: {
                    permissions: result.previousPermissionActions,
                },
                after: {
                    permissions: result.currentPermissionActions,
                },
                details: {
                    roleName: result.roleName,
                    changes: {
                        addedPermissions: result.addedPermissions,
                        removedPermissions: result.removedPermissions,
                    }
                }
            });
        }
        return result.currentPermissions;
    }
}
//# sourceMappingURL=update-role-permissions.usecase.js.map