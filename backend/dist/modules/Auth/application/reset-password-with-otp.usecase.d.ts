import type JwtProvider from "../domain/jwt.provider.js";
import type { UsersRepository } from "../../Users/domain/users.repository.js";
import type { AuthRepository } from "../domain/auth.repository.js";
import type { HashProvider } from "../../../shared/domain/hash.provider.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export interface ResetPasswordWithOtpDTO {
    resetToken: string;
    currentPassword?: string;
    newPassword: string;
    confirmPassword?: string;
}
export declare class ResetPasswordWithOtpUseCase {
    private readonly jwtProvider;
    private readonly usersRepository;
    private readonly authRepository;
    private readonly hashProvider;
    private readonly auditLogService;
    constructor(jwtProvider: JwtProvider, usersRepository: UsersRepository, authRepository: AuthRepository, hashProvider: HashProvider, auditLogService: AuditLogService);
    execute(dto: ResetPasswordWithOtpDTO, context?: AuditContext): Promise<void>;
}
//# sourceMappingURL=reset-password-with-otp.usecase.d.ts.map