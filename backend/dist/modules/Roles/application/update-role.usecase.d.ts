import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role, UpdateRole } from "../domain/role.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class UpdateRoleUseCase {
    private readonly rolesRepository;
    private readonly auditLogService;
    constructor(rolesRepository: RolesRepository, auditLogService: AuditLogService);
    execute(id: string, data: UpdateRole, auditContext?: AuditContext): Promise<Role>;
}
//# sourceMappingURL=update-role.usecase.d.ts.map