import type { HashProvider } from "../../../shared/domain/hash.provider.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
interface LoginDTO {
    email: string;
    password: string;
}
interface LoginResponse {
    accessToken: string;
    refreshToken: string;
    user: {
        id: string;
        name: string;
        email: string;
        permissions: string[];
        roles: string[];
        isVerify: boolean;
    };
}
export declare class LoginUseCase {
    private readonly authRepository;
    private readonly jwtProvider;
    private readonly hashProvider;
    private readonly auditLogService;
    constructor(authRepository: AuthRepository, jwtProvider: JwtProvider, hashProvider: HashProvider, auditLogService: AuditLogService);
    execute(data: LoginDTO, context?: AuditContext): Promise<LoginResponse>;
}
export {};
//# sourceMappingURL=login.usecase.d.ts.map