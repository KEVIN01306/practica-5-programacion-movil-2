import type { UsersRepository } from "../domain/users.repository.js";
import type { GetUser } from "../domain/user.entity.js";
import type { HashProvider } from "../../../shared/domain/hash.provider.js";
import type { EmailProvider } from "../../../shared/domain/email.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export interface CreateUserRequest {
    email: string;
    passwordRaw?: string;
    autoGeneratePassword?: boolean;
    firstName: string;
    lastName: string;
    roles?: string[];
}
export declare class CreateUserUseCase {
    private readonly usersRepository;
    private readonly hashProvider;
    private readonly emailProvider;
    private readonly auditLogService;
    constructor(usersRepository: UsersRepository, hashProvider: HashProvider, emailProvider: EmailProvider, auditLogService: AuditLogService);
    execute(data: CreateUserRequest, context?: AuditContext): Promise<GetUser>;
}
//# sourceMappingURL=create-user.usecase.d.ts.map