import type { RolesRepository } from "../domain/roles.repository.js";
import type { Role, CreateRole } from "../domain/role.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class CreateRoleUseCase {
    private readonly rolesRepository;
    private readonly auditLogService;
    constructor(rolesRepository: RolesRepository, auditLogService: AuditLogService);
    execute(data: CreateRole, auditContext?: AuditContext): Promise<Role>;
}
//# sourceMappingURL=create-role.usecase.d.ts.map