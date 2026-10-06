import type { OtpProvider, SendOtpResult } from "../domain/otp.provider.js";
import type { UsersRepository } from "../../Users/domain/users.repository.js";
import type { AuditLogService } from "../../Audit/application/audit-log.service.js";
import type { AuditContext } from "../../Audit/domain/audit-log.entity.js";
export interface SendOtpDTO {
    email: string;
    type?: 'PASSWORD_RESET' | 'OTP';
}
export declare class SendOtpUseCase {
    private readonly otpProvider;
    private readonly usersRepository;
    private readonly auditLogService;
    constructor(otpProvider: OtpProvider, usersRepository: UsersRepository, auditLogService: AuditLogService);
    execute(dto: SendOtpDTO, context?: AuditContext): Promise<SendOtpResult>;
}
//# sourceMappingURL=send-otp.usecase.d.ts.map