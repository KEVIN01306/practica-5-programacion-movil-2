import type { UsersRepository } from "../domain/users.repository.js";
import type { HashProvider } from "../../../shared/domain/hash.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword?: string;
}
export declare class ChangePasswordUseCase {
    private readonly usersRepository;
    private readonly hashProvider;
    private readonly auditLogService;
    constructor(usersRepository: UsersRepository, hashProvider: HashProvider, auditLogService: AuditLogService);
    execute(userId: string, data: ChangePasswordRequest, context?: AuditContext): Promise<void>;
}
export {};
//# sourceMappingURL=change-password.usecase.d.ts.map