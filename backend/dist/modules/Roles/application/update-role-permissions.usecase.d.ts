import type { RolesRepository } from "../domain/roles.repository.js";
import type { Permission } from "../domain/role.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class UpdateRolePermissionsUseCase {
    private readonly rolesRepository;
    private readonly auditLogService;
    constructor(rolesRepository: RolesRepository, auditLogService: AuditLogService);
    execute(roleId: string, permissionIds: string[], auditContext?: AuditContext): Promise<Permission[]>;
}
//# sourceMappingURL=update-role-permissions.usecase.d.ts.map