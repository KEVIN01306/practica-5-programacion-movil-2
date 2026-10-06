import type { UsersRepository } from "../domain/users.repository.js";
import type { GetUser } from "../domain/user.entity.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export declare class ActivateUserUseCase {
    private readonly usersRepository;
    private readonly auditLogService;
    constructor(usersRepository: UsersRepository, auditLogService: AuditLogService);
    execute(id: string, context?: AuditContext): Promise<GetUser>;
}
//# sourceMappingURL=activate-user.usecase.d.ts.map