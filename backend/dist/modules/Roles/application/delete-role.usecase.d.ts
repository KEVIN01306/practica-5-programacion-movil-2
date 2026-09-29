import type { RolesRepository } from "../domain/roles.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class DeleteRoleUseCase {
    private readonly rolesRepository;
    private readonly auditLogService;
    constructor(rolesRepository: RolesRepository, auditLogService: AuditLogService);
    execute(id: string, auditContext?: AuditContext): Promise<void>;
}
//# sourceMappingURL=delete-role.usecase.d.ts.map