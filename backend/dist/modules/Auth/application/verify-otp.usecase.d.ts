import type { OtpProvider } from "../domain/otp.provider.js";
import type JwtProvider from "../domain/jwt.provider.js";
import type { UsersRepository } from "../../Users/domain/users.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export interface VerifyOtpDTO {
    email: string;
    code: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}
export interface VerifyOtpResponse {
    success: boolean;
    verified: boolean;
    resetToken: string;
    message: string;
}
export declare class VerifyOtpUseCase {
    private readonly otpProvider;
    private readonly jwtProvider;
    private readonly usersRepository;
    private readonly auditLogService;
    constructor(otpProvider: OtpProvider, jwtProvider: JwtProvider, usersRepository: UsersRepository, auditLogService: AuditLogService);
    execute(dto: VerifyOtpDTO, context?: AuditContext): Promise<VerifyOtpResponse>;
}
//# sourceMappingURL=verify-otp.usecase.d.ts.map