import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";
import type { AuditLogService } from "@modules/Audit/application/audit-log.service.js";
import type { AuditContext } from "@modules/Audit/domain/audit-log.entity.js";

export class UpdateRolePermissionsUseCase {
    constructor(
        private readonly rolesRepository: RolesRepository,
        private readonly auditLogService: AuditLogService
    ) {}

    async execute(roleId: string, permissionIds: string[], auditContext?: AuditContext): Promise<Permission[]> {
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
